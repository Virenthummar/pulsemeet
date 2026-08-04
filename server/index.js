import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from './db.js';
import User from './models/User.js';
import Activity from './models/Activity.js';
import ChatMessage from './models/ChatMessage.js';
import Review from './models/Review.js';
import HangoutSignal from './models/HangoutSignal.js';
import EmailLog from './models/EmailLog.js';
import EmailQueue from './models/EmailQueue.js';
import { sendDigestEmail, verifyUnsubscribeToken } from './services/emailService.js';

// Haversine formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);  
  const dLon = (lon2 - lon1) * (Math.PI / 180); 
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
}

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ensure MongoDB database connection before handling requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.warn('MongoDB connection error in route middleware:', err.message);
    next();
  }
});

// GET /api/activities — Fetch all activities from MongoDB
app.get('/api/activities', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 }).lean();
    // Strip Mongoose internal fields so frontend Activity type matches cleanly
    const cleaned = activities.map(act => {
      const { _id, __v, ...rest } = act;
      // Ensure createdAt is a string
      if (rest.createdAt instanceof Date) rest.createdAt = rest.createdAt.toISOString();
      if (rest.updatedAt instanceof Date) rest.updatedAt = rest.updatedAt.toISOString();
      // Clean _id from nested participants/waitlist arrays
      if (Array.isArray(rest.participants)) {
        rest.participants = rest.participants.map(p => {
          const { _id: pId, ...pRest } = p;
          return pRest;
        });
      }
      if (Array.isArray(rest.waitlist)) {
        rest.waitlist = rest.waitlist.map(w => {
          const { _id: wId, ...wRest } = w;
          return wRest;
        });
      }
      return rest;
    });
    res.json(cleaned);
  } catch (err) {
    console.warn('MongoDB fetch error, returning fallback:', err.message);
    res.json([]);
  }
});

// POST /api/activities — Create or update activity in MongoDB (upsert to prevent duplicate key errors)
app.post('/api/activities', async (req, res) => {
  try {
    if (!req.body || !req.body.id) return res.json({ success: false });
    
    // Check if new to trigger notifications
    const existing = await Activity.findOne({ id: req.body.id });
    const isNew = !existing;

    // Use findOneAndUpdate with upsert to handle both new and existing activities
    const saved = await Activity.findOneAndUpdate(
      { id: req.body.id },
      req.body,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (isNew) {
      // Find eligible users for email notifications
      const users = await User.find({
        'notificationSettings.emailNewNearbyPosts': true,
        id: { $ne: req.body.hostId }
      });

      const queueItems = [];
      for (const user of users) {
        // Skip if invite-only (mocking condition here if visibility exists)
        if (req.body.visibility === 'invite-only') continue;

        // Skip if category filter doesn't match
        const cats = user.notificationSettings?.categories || [];
        if (cats.length > 0 && !cats.includes(req.body.category)) continue;

        // Check distance
        const distance = getDistanceFromLatLonInKm(user.lat, user.lng, req.body.lat, req.body.lng);
        const maxDist = user.notificationSettings?.radiusKm || 5;

        if (distance <= maxDist) {
          queueItems.push({
            userId: user.id,
            activityId: req.body.id
          });
        }
      }

      if (queueItems.length > 0) {
        await EmailQueue.insertMany(queueItems);
      }
    }

    res.status(201).json(saved);
  } catch (err) {
    console.warn('MongoDB save error:', err.message);
    res.json({ success: false, error: err.message });
  }
});

// PUT /api/activities/:id — Update activity (RSVP / Participants / Waitlist)
app.put('/api/activities/:id', async (req, res) => {
  try {
    const updated = await Activity.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/activities/:id — Delete activity from MongoDB
app.delete('/api/activities/:id', async (req, res) => {
  try {
    await Activity.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users — Fetch users from MongoDB
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users — Create / Save user in MongoDB
app.post('/api/users', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { id: req.body.id },
      req.body,
      { new: true, upsert: true }
    );
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id — Delete user from MongoDB
app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.deleteOne({ id: req.params.id });
    await Activity.deleteMany({ hostId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chats — Fetch chat messages from MongoDB
app.get('/api/chats', async (req, res) => {
  try {
    const messages = await ChatMessage.find().sort({ createdAt: 1 });
    const grouped = messages.reduce((acc, msg) => {
      acc[msg.activityId] = acc[msg.activityId] || [];
      acc[msg.activityId].push(msg);
      return acc;
    }, {});
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chats — Save chat message in MongoDB
app.post('/api/chats', async (req, res) => {
  try {
    const message = new ChatMessage(req.body);
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reviews — Fetch reviews from MongoDB
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews — Save host review in MongoDB
app.post('/api/reviews', async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/hangout-signals — Submit a "Would hang again" signal
app.post('/api/hangout-signals', async (req, res) => {
  try {
    const { id, fromUserId, toUserId, activityId, wantsAgain, createdAt } = req.body;
    
    // Upsert the signal
    const signal = await HangoutSignal.findOneAndUpdate(
      { fromUserId, toUserId, activityId },
      { id, fromUserId, toUserId, activityId, wantsAgain, createdAt },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // If wantsAgain is true, check for a mutual match
    let isMatch = false;
    if (wantsAgain) {
      const reverseSignal = await HangoutSignal.findOne({
        fromUserId: toUserId,
        toUserId: fromUserId,
        wantsAgain: true
      });
      if (reverseSignal) {
        isMatch = true;
      }
    }
    
    res.status(201).json({ success: true, signal, isMatch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/connections/:userId — Get mutual connections for a user
app.get('/api/connections/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    // Find all signals sent by the user where wantsAgain = true
    const sentSignals = await HangoutSignal.find({ fromUserId: userId, wantsAgain: true });
    
    // Find all signals received by the user where wantsAgain = true
    const receivedSignals = await HangoutSignal.find({ toUserId: userId, wantsAgain: true });
    
    // Mutual matches: where the other person is in both sent and received
    const sentToIds = new Set(sentSignals.map(s => s.toUserId));
    const mutualConnections = receivedSignals
      .filter(s => sentToIds.has(s.fromUserId))
      .map(s => s.fromUserId); // this is a list of user IDs we match with
      
    // Remove duplicates
    const uniqueConnections = Array.from(new Set(mutualConnections));
    
    res.json(uniqueConnections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hangout-signals/:userId — Get all signals submitted by this user (to hide prompts)
app.get('/api/hangout-signals/:userId', async (req, res) => {
  try {
    const signals = await HangoutSignal.find({ fromUserId: req.params.userId });
    res.json(signals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications/unsubscribe
app.get('/api/notifications/unsubscribe', async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = verifyUnsubscribeToken(token);
    
    if (!decoded || !decoded.userId) {
      return res.status(400).send('Invalid or expired unsubscribe link.');
    }

    await User.findOneAndUpdate(
      { id: decoded.userId },
      { $set: { 'notificationSettings.emailNewNearbyPosts': false } }
    );

    res.send('<html><body style="font-family:sans-serif;text-align:center;padding:50px;"><h2>You have been unsubscribed.</h2><p>You will no longer receive nearby activity emails.</p></body></html>');
  } catch (err) {
    res.status(500).send('Error processing request.');
  }
});

// Batch Processor Cron (Runs every 1 minute for demo, groups items older than 15 mins. For demo we process immediately if older than 1 min to show functionality)
setInterval(async () => {
  try {
    const cutoff = new Date(Date.now() - 1 * 60 * 1000); // 1 minute for demo, usually 15
    const items = await EmailQueue.find({ createdAt: { $lte: cutoff } });
    
    if (items.length === 0) return;

    // Group by User
    const userGroups = items.reduce((acc, item) => {
      if (!acc[item.userId]) acc[item.userId] = [];
      acc[item.userId].push(item);
      return acc;
    }, {});

    for (const [userId, queueItems] of Object.entries(userGroups)) {
      const user = await User.findOne({ id: userId });
      if (!user || user.notificationSettings?.emailNewNearbyPosts === false) {
        await EmailQueue.deleteMany({ _id: { $in: queueItems.map(i => i._id) } });
        continue;
      }

      const activitiesData = [];
      const logEntries = [];
      const queueIdsToDelete = [];

      for (const item of queueItems) {
        // Prevent duplicate sends
        const existingLog = await EmailLog.findOne({ userId, activityId: item.activityId });
        if (existingLog) {
          queueIdsToDelete.push(item._id);
          continue;
        }

        const activity = await Activity.findOne({ id: item.activityId });
        if (activity) {
          const distanceKm = getDistanceFromLatLonInKm(user.lat, user.lng, activity.lat, activity.lng);
          activitiesData.push({ activity, distanceKm });
          logEntries.push({
            userId,
            activityId: activity.id,
            sentAt: new Date().toISOString()
          });
        }
        queueIdsToDelete.push(item._id);
      }

      if (activitiesData.length > 0) {
        const result = await sendDigestEmail(user, activitiesData);
        if (result.success) {
          await EmailLog.insertMany(logEntries);
        }
      }
      
      await EmailQueue.deleteMany({ _id: { $in: queueIdsToDelete } });
    }
  } catch (err) {
    console.warn('Batch processor error:', err.message);
  }
}, 60 * 1000);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`MongoDB Express API Server running on port ${PORT}`);
  });
}

export default app;

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from './db.js';
import User from './models/User.js';
import Activity from './models/Activity.js';
import ChatMessage from './models/ChatMessage.js';
import Review from './models/Review.js';

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
    const activities = await Activity.find().sort({ createdAt: -1 });
    res.json(activities);
  } catch (err) {
    console.warn('MongoDB fetch error, returning fallback:', err.message);
    res.json([]);
  }
});

// POST /api/activities — Create new activity in MongoDB
app.post('/api/activities', async (req, res) => {
  try {
    if (!req.body || !req.body.id) return res.json({ success: false });
    const newActivity = new Activity(req.body);
    await newActivity.save();
    res.status(201).json(newActivity);
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

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`MongoDB Express API Server running on port ${PORT}`);
  });
}

export default app;

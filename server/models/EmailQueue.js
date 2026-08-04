import mongoose from 'mongoose';

const EmailQueueSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  activityId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.EmailQueue || mongoose.model('EmailQueue', EmailQueueSchema);

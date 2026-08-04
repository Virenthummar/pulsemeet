import mongoose from 'mongoose';

const EmailLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  activityId: { type: String, required: true },
  postType: { type: String, default: 'activity' },
  sentAt: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.EmailLog || mongoose.model('EmailLog', EmailLogSchema);

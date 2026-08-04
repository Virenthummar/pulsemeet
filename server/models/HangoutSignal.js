import mongoose from 'mongoose';

const HangoutSignalSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  fromUserId: { type: String, required: true },
  toUserId: { type: String, required: true },
  activityId: { type: String, required: true },
  wantsAgain: { type: Boolean, required: true },
  createdAt: { type: String, required: true }
}, { timestamps: true });

// Prevent duplicate signals for the same pair in the same activity
HangoutSignalSchema.index({ fromUserId: 1, toUserId: 1, activityId: 1 }, { unique: true });

export default mongoose.models.HangoutSignal || mongoose.model('HangoutSignal', HangoutSignalSchema);

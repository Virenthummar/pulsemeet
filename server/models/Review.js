import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  activityId: String,
  hostId: { type: String, required: true },
  reviewerId: { type: String, required: true },
  reviewerName: String,
  reviewerAvatar: String,
  rating: { type: Number, required: true },
  comment: String,
  timestamp: String
}, { timestamps: true });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  bio: { type: String, default: '' },
  avatar: { type: String },
  interests: [{ type: String }],
  verified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  activitiesHostedCount: { type: Number, default: 0 },
  activitiesJoinedCount: { type: Number, default: 0 },
  joinedDate: { type: String, default: 'Today' },
  lat: { type: Number },
  lng: { type: Number },
  notificationSettings: {
    emailNewNearbyPosts: { type: Boolean, default: true },
    radiusKm: { type: Number, default: 5 },
    categories: [{ type: String }]
  }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);

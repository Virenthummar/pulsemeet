import mongoose from 'mongoose';

const ParticipantSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  userAvatar: String,
  isVerified: Boolean,
  joinedAt: String,
  status: { type: String, enum: ['confirmed', 'waitlisted', 'pending'], default: 'confirmed' }
});

const ActivitySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  hostId: { type: String, required: true },
  hostName: String,
  hostAvatar: String,
  hostVerified: Boolean,
  hostRating: Number,
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  datetime: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  address: String,
  approxLocation: String,
  exactMeetingPoint: String,
  maxParticipants: Number,
  participants: [ParticipantSchema],
  waitlist: [ParticipantSchema],
  visibility: { type: String, default: 'public' },
  requiresApproval: { type: Boolean, default: false },
  coverImage: String,
  status: { type: String, default: 'upcoming' },
  weather: {
    temp: Number,
    condition: String,
    rainProbability: Number,
    isOutdoorWarning: Boolean,
    warningText: String
  }
}, { timestamps: true });

export default mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);

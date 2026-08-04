import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  activityId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: String,
  senderAvatar: String,
  text: { type: String, required: true },
  timestamp: String,
  isSystem: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);

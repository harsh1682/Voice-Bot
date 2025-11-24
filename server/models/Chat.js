import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  text: { type: String, required: true },
  sender: { type: String, enum: ['user', 'bot'], required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Chat', chatSchema);
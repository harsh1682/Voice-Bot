import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ------------------- MIDDLEWARE -------------------
app.use(cors({
  origin: ['https://voice-bot-omega-five.vercel.app'], // frontend URL
}));
app.use(bodyParser.json());

// ------------------- MONGODB -------------------
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("MongoDB connection error:", err));

const chatSchema = new mongoose.Schema({
  userId: String,
  text: String,
  sender: String,
  createdAt: { type: Date, default: Date.now }
});

const Chat = mongoose.model('Chat', chatSchema);

// ------------------- GET USER CHATS -------------------
app.get('/api/chats/:userId', async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.params.userId }).sort({ createdAt: 1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- POST NEW CHAT -------------------
app.post('/api/chats', async (req, res) => {
  try {
    const { userId, text, sender } = req.body;
    const newChat = new Chat({ userId, text, sender });
    await newChat.save();
    res.json(newChat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- DELETE USER CHATS -------------------
app.delete('/api/chats/:userId', async (req, res) => {
  try {
    await Chat.deleteMany({ userId: req.params.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- AI ROUTE -------------------
app.post('/api/chat-ai', async (req, res) => {
  const { text } = req.body;
  const apiKey = process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY missing" });

  try {
    // Prompt only asks for 2-3 concise sentences
    const prompt = `Answer the following in 2-3 concise sentences. Do NOT give long explanations.\n\nQuestion: ${text}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );

    const data = await response.json();

    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
                   "Sorry, I couldn't understand.";

    res.json({ text: aiText });

  } catch (error) {
    res.status(502).json({ error: "Failed to reach Gemini API", details: error.message });
  }
});

// ------------------- START SERVER -------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Connected to MongoDB Atlas`);
  console.log(`Available at your primary URL http://localhost:${PORT}`);
});

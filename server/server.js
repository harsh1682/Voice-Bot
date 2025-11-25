import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Chat from './models/Chat.js';
import fetch from 'node-fetch'; // Required for Render

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------ CORS FIX ------------------
app.use(cors({
  origin: [
    "https://voice-bot-omega-five.vercel.app", // Vercel frontend
    "http://localhost:3000"                    // Local frontend
  ],
  methods: ["GET", "POST", "DELETE"],
  credentials: true
}));

app.use(express.json());

// ------------------ HEALTH CHECK ------------------
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// ------------------ DATABASE ------------------
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ------------------ ROUTES ------------------
app.get('/api/chats/:userId', async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.params.userId }).sort({ createdAt: 1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chats', async (req, res) => {
  try {
    const newChat = new Chat(req.body);
    const savedChat = await newChat.save();
    res.status(201).json(savedChat);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/chats/:userId', async (req, res) => {
  try {
    await Chat.deleteMany({ userId: req.params.userId });
    res.json({ message: "History cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------ AI ROUTE ------------------
app.post('/api/chat-ai', async (req, res) => {
  const { text } = req.body;
  const apiKey = process.env.VITE_GEMINI_API_KEY; // Stored securely in Render

  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY missing in backend env" });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }]
        })
      }
    );

    const data = await response.json();

    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't understand.";

    res.json({ text: aiText });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------ SERVER START ------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

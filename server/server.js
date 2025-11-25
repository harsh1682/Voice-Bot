import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Chat from './models/Chat.js';
import fetch from 'node-fetch'; // make sure to install node-fetch

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------ CORS ------------------
app.use(cors({
  origin: [
    "https://voice-bot-omega-five.vercel.app", // frontend deployed URL
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "DELETE"]
}));

app.use(express.json());

// ------------------ HEALTH CHECK ------------------
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// ------------------ DATABASE ------------------
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB error:', err));

// ------------------ ROUTES ------------------
// Get all chats for a user
app.get('/api/chats/:userId', async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.params.userId }).sort({ createdAt: 1 });
    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Save a chat message
app.post('/api/chats', async (req, res) => {
  try {
    const newChat = new Chat(req.body);
    const savedChat = await newChat.save();
    res.status(201).json(savedChat);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Delete all chats for a user
app.delete('/api/chats/:userId', async (req, res) => {
  try {
    await Chat.deleteMany({ userId: req.params.userId });
    res.json({ message: "History cleared" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// ------------------ AI ROUTE ------------------
app.post('/api/chat-ai', async (req, res) => {
  const { text } = req.body;
  const apiKey = process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing!");
    return res.status(500).json({ error: "GEMINI_API_KEY missing" });
  }

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "No text provided" });
  }

  console.log("Received text for AI:", text);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }]
        }),
        timeout: 15000 // 15s timeout
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", response.status, errText);
      return res.status(response.status).json({ error: "Gemini API error", details: errText });
    }

    const data = await response.json();
    console.log("Gemini API response:", data);

    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't understand.";

    res.json({ text: aiText });

  } catch (error) {
    console.error("Failed to fetch from Gemini:", error);
    res.status(502).json({ error: "Failed to reach Gemini API", details: error.message });
  }
});

// ------------------ SERVER START ------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

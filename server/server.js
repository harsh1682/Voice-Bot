import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Chat from './models/Chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://voice-bot-omega-five.vercel.app", // Vercel frontend
  "https://voice-bot-wheat.vercel.app",
  "http://localhost:3000"
];

// Apply CORS for all routes early
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (e.g. curl, Postman)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// API to get chats by userId
app.get('/api/chats/:userId', async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.params.userId }).sort({ createdAt: 1 });
    res.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

// API to post a new chat message
app.post('/api/chats', async (req, res) => {
  try {
    const newChat = new Chat(req.body);
    const savedChat = await newChat.save();
    res.status(201).json(savedChat);
  } catch (error) {
    console.error("Error saving chat:", error);
    res.status(400).json({ error: error.message });
  }
});

// API to delete chats by userId
app.delete('/api/chats/:userId', async (req, res) => {
  try {
    await Chat.deleteMany({ userId: req.params.userId });
    res.json({ message: "History cleared" });
  } catch (error) {
    console.error("Error deleting chats:", error);
    res.status(500).json({ error: error.message });
  }
});

// AI route (unchanged)
app.post('/api/chat-ai', async (req, res) => {
  const { text } = req.body;
  const apiKey = process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY missing" });
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
    console.error("AI request error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Generic error handler middleware (to catch CORS and other errors)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  if (err.message.includes('CORS')) {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

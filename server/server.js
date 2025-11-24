import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Chat from './models/Chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- ROUTES ---

// 1. Get Chats for a User
app.get('/api/chats/:userId', async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.params.userId }).sort({ createdAt: 1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Add a Message (Save to DB)
app.post('/api/chats', async (req, res) => {
  try {
    const newChat = new Chat(req.body);
    const savedChat = await newChat.save();
    res.status(201).json(savedChat);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 3. Clear History
app.delete('/api/chats/:userId', async (req, res) => {
  try {
    await Chat.deleteMany({ userId: req.params.userId });
    res.json({ message: "History cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Chat with AI (SECURE BACKEND PROXY)
app.post('/api/chat-ai', async (req, res) => {
  const { text } = req.body;
  const apiKey = process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ Server Error: GEMINI_API_KEY is missing in .env");
    return res.status(500).json({ error: "Server configuration error: Missing API Key" });
  }

  try {
    console.log("🤖 Backend sending to Gemini:", text);
    
    const promptWithInstructions = `You are a helpful assistant. Please answer the following input politely and formally. Keep your answer strict and short, within 2-3 lines max. \n\nInput: ${text}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptWithInstructions }] }]
        })
      }
    );

    if (!response.ok) {
       const errorData = await response.json().catch(() => ({}));
       throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
        return res.json({ text: "I didn't understand that." });
    }

    const aiText = data.candidates[0].content.parts[0].text;
    console.log("✅ Backend received AI response");
    
    res.json({ text: aiText });

  } catch (error) {
    console.error("❌ Backend AI Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
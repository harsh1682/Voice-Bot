# AI Voice Assistant Bot

[🔴 LIVE DEMO](https://voice-bot-omega-five.vercel.app/)

A full-stack Voice Assistant application capable of listening to speech, processing natural language using Google's Gemini AI, and responding with spoken audio.

## Tech Stack

- **Frontend:** React + Vite, Tailwind CSS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB Atlas  
- **AI:** Google Gemini 1.5 Flash  
- **APIs:** Web Speech API (Text-to-Speech & Speech-to-Text)

## 🚀 Features

- 🎙️ **Voice Interaction:** Speak to the bot and hear it speak back.  
- 🧠 **Smart AI:** Powered by Google Gemini for intelligent, context-aware responses.  
- 🌗 **Dark Mode UI:** A modern, responsive chat interface.  
- 📊 **Dashboard:** Analytics for tracking user engagement.  
- ⚙️ **Settings:** Adjustable voice speed and pitch.  

## 🛠️ Installation & Setup

This project has two parts: the **Client (Frontend)** and the **Server (Backend)**. You need to run both.

### 1. Server Setup (Backend)

Navigate to the server folder:

bash
cd server
Install dependencies:

bash
Copy code
npm install
Create a .env file in the server/ folder:

ini
Copy code
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
PORT=5000
Start the server:

bash
Copy code
npm start
The server should run on http://localhost:5000

### 2. Client Setup (Frontend)
Open a new terminal and navigate to the root folder:

bash
Copy code
cd voice-bot
Install dependencies:

bash
Copy code
npm install
Start the React app:

bash
Copy code
npm run dev
Open the link shown in the terminal (usually http://localhost:5173).

## ⚠️ Troubleshooting
"Network Error" / "Processing..." forever:
Ensure the Backend Server is running (npm start inside server/).
Check the .env file in server/ has the correct GEMINI_API_KEY.

Microphone not working:
Ensure you have granted microphone permissions in your browser.
Check if your browser supports the Web Speech API (Chrome/Edge recommended).

## 📄 License
This project is open source and available for educational purposes.

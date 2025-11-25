import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Trash2, Cpu, AlertCircle } from 'lucide-react';
import { generateBotResponse } from '../utils/botLogic';
import { speakText, useSpeechRecognition, cancelSpeech } from '../utils/helpers';

// 🔥 RENDER BACKEND URL
const API_URL = 'https://voice-bot-1-t1ys.onrender.com/api/chats';

const AssistantView = ({ user, settings }) => {
  const [messages, setMessages] = useState([]);
  const [inputBuffer, setInputBuffer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const messagesEndRef = useRef(null);
  const { isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechRecognition();

  // ------------------- LOAD CHATS -------------------
  const fetchChats = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/${user.uid}`);
      if (!res.ok) throw new Error("Failed to fetch chats");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Load Error:", err);
      setErrorMessage("Could not connect to Database Server.");
    }
  };

  useEffect(() => { fetchChats(); }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, transcript, isProcessing]);

  useEffect(() => {
    if (transcript) setInputBuffer(transcript);
  }, [transcript]);

  useEffect(() => {
    if (!isListening && transcript.trim() !== "" && !isProcessing) {
      handleSendMessage(transcript);
    }
  }, [isListening]);

  // ------------------- SEND MESSAGE -------------------
  const handleSendMessage = async (text) => {
    if (!text.trim() || !user) return;

    const messageText = text.trim();
    setInputBuffer('');
    resetTranscript();
    setIsProcessing(true);
    setErrorMessage(null);

    const tempUserMsg = { _id: Date.now(), text: messageText, sender: 'user' };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      // ------------------- AI RESPONSE -------------------
      const botText = await generateBotResponse(messageText);

      speakText(botText, settings);

      // ------------------- SAVE USER & BOT MESSAGES -------------------
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, text: messageText, sender: 'user' })
      });

      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, text: botText, sender: 'bot' })
      });

      fetchChats();

    } catch (error) {
      console.error("Send Error:", error);
      setErrorMessage("Connection Error: Could not reach server.");
      speakText("I encountered a connection error.", settings);
    } finally {
      setIsProcessing(false);
    }
  };

  // ------------------- MIC -------------------
  const handleMicToggle = () => {
    if (isProcessing) return;
    if (isListening) stopListening();
    else { cancelSpeech(); startListening(); }
  };

  // ------------------- CLEAR CHAT HISTORY -------------------
  const clearHistory = async () => {
    if (!user || !window.confirm("Clear history?")) return;
    try {
      await fetch(`${API_URL}/${user.uid}`, { method: 'DELETE' });
      setMessages([]);
    } catch (err) { alert("Failed to delete history."); }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 pb-64 scrollbar-hide w-full max-w-5xl mx-auto">
        {messages.length === 0 && !errorMessage && (
          <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-4">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center animate-bounce-slow">
              <Cpu className="w-10 h-10 text-indigo-400" />
            </div>
            <p className="text-slate-400 font-light">MongoDB Online. Ready.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={msg._id || idx} className={`flex w-full animate-message ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3 shadow-md text-sm md:text-base leading-relaxed ${
              msg.sender === 'user' ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-br-sm' : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {errorMessage && (
          <div className="flex w-full justify-center">
            <div className="bg-red-900/80 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl text-center max-w-md shadow-lg backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 inline mr-2" />
              {errorMessage}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex w-full justify-start">
            <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl flex items-center gap-2">
              <span className="text-xs text-indigo-400 font-mono">AI THINKING</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        {isListening && (
          <div className="flex w-full justify-end">
            <div className="max-w-[85%] rounded-2xl px-5 py-3 bg-indigo-900/30 border border-indigo-500/30 text-indigo-200 backdrop-blur-sm">
              {transcript || "Listening..."}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent z-20">
        <div className="flex items-end gap-3 max-w-4xl mx-auto w-full">
          <button onClick={clearHistory} className="p-3 rounded-full bg-slate-800 text-slate-400 border border-slate-700 hover:bg-red-500/10 hover:text-red-400 transition-all">
            <Trash2 className="w-5 h-5" />
          </button>

          <div className="flex-1 bg-slate-900 rounded-3xl border border-slate-700 flex items-center px-4 py-2 shadow-xl">
            <input
              type="text"
              value={inputBuffer}
              onChange={(e) => setInputBuffer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputBuffer)}
              placeholder={isProcessing ? "Processing..." : "Type a message..."}
              disabled={isProcessing}
              className="flex-1 bg-transparent outline-none text-slate-200 placeholder:text-slate-600"
            />
            <button
              onClick={() => handleSendMessage(inputBuffer)}
              disabled={isProcessing || !inputBuffer.trim()}
              className="p-2 ml-2 text-indigo-400 hover:bg-indigo-500/10 rounded-full disabled:opacity-30"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleMicToggle}
            disabled={isProcessing}
            className={`p-4 rounded-full shadow-lg ${isListening ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssistantView;

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Bot, Trash2, Cpu, AlertCircle } from 'lucide-react';
import { generateBotResponse } from '../utils/botLogic';
import { speakText, useSpeechRecognition, cancelSpeech } from '../utils/helpers';

const API_URL = 'http://localhost:5000/api/chats';

const AssistantView = ({ user, settings }) => {
  const [messages, setMessages] = useState([]);
  const [inputBuffer, setInputBuffer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const { isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechRecognition();

  // Load chats from MongoDB
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

  useEffect(() => {
    fetchChats();
  }, [user]);

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

  const handleSendMessage = async (text) => {
    if (!text.trim() || !user) return;
    
    const messageText = text.trim();
    setInputBuffer('');
    resetTranscript();
    setIsProcessing(true);
    setErrorMessage(null);

    // Optimistic UI: Show user message immediately
    const tempUserMsg = { _id: Date.now(), text: messageText, sender: 'user' };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      // --- UPDATED LOGIC: Call Backend Proxy ---
      // No API Key passed here. The backend has it.
      const aiResponse = await generateBotResponse(messageText);
      
      speakText(aiResponse, settings);

      // Save User Message to DB
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, text: messageText, sender: 'user' })
      });

      // Save Bot Message to DB
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, text: aiResponse, sender: 'bot' })
      });

      // Sync with DB to get real IDs
      fetchChats();

    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(error.message);
      speakText("I encountered a connection error.", settings);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMicToggle = () => {
    if (isProcessing) return;
    if (isListening) {
      stopListening();
    } else {
      cancelSpeech(); 
      startListening();
    }
  };

  const clearHistory = async () => {
    if (!user || !window.confirm("Clear history?")) return;
    try {
      await fetch(`${API_URL}/${user.uid}`, { method: 'DELETE' });
      setMessages([]);
    } catch (err) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Padded container to avoid overlap with input */}
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
                msg.sender === 'user'
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-br-sm'
                  : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-sm'
              }`}>
              {msg.text}
            </div>
          </div>
        ))}

         {errorMessage && (
          <div className="flex w-full justify-center animate-message">
             <div className="bg-red-900/80 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl flex flex-col items-center text-center gap-1 max-w-md shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 font-bold text-red-300">
                  <AlertCircle className="w-5 h-5" /> Error
                </div>
                <span className="text-sm">{errorMessage}</span>
             </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex w-full justify-start animate-message">
             <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
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
           <div className="flex w-full justify-end animate-message">
             <div className="max-w-[85%] rounded-2xl px-5 py-3 bg-indigo-900/30 border border-indigo-500/30 text-indigo-200 backdrop-blur-sm rounded-br-sm">
                <span className="flex items-center gap-2">
                   <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                   {transcript || "Listening..."}
                </span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent z-20">
        <div className="flex items-end gap-3 max-w-4xl mx-auto w-full">
          <button onClick={clearHistory} className="p-3 mb-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 hover:bg-red-500/10 hover:text-red-400 transition-all shrink-0">
            <Trash2 className="w-5 h-5" />
          </button>
          
          <div className="flex-1 bg-slate-900 rounded-3xl border border-slate-700 flex items-center px-4 py-2 shadow-xl focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <input 
              type="text" 
              value={inputBuffer}
              onChange={(e) => setInputBuffer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputBuffer)}
              placeholder={isProcessing ? "Processing..." : "Type a message..."}
              disabled={isProcessing}
              className="flex-1 bg-transparent border-none outline-none text-sm md:text-base text-slate-200 placeholder:text-slate-600 disabled:opacity-50 min-w-0"
            />
            <button 
               onClick={() => handleSendMessage(inputBuffer)} 
               disabled={isProcessing || !inputBuffer.trim()}
               className="p-2 ml-2 text-indigo-400 hover:bg-indigo-500/10 rounded-full disabled:opacity-30 transition-colors shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleMicToggle}
            disabled={isProcessing}
            className={`p-4 rounded-full shadow-lg transition-all duration-300 transform active:scale-95 shrink-0 ${
              isListening ? 'bg-red-500 text-white mic-active' : 'bg-indigo-600 text-white hover:bg-indigo-500'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssistantView;
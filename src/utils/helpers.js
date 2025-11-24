import { useState, useEffect, useRef } from 'react';

// --- NEW: Function to stop speech explicitly ---
export const cancelSpeech = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

export const speakText = (text, settings = {}) => {
  // Check browser support
  if (!window.speechSynthesis) {
    console.error("❌ Speech Synthesis not supported in this browser.");
    return;
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Apply settings with fallbacks
  utterance.pitch = settings.pitch || 1;
  utterance.rate = settings.rate || 1;
  utterance.volume = settings.volume || 1;
  
  // Optional: Log start/end for debugging
  utterance.onstart = () => console.log("🔊 Started speaking...");
  utterance.onend = () => console.log("✅ Finished speaking.");
  utterance.onerror = (e) => console.error("❌ Speech Error:", e);

  window.speechSynthesis.speak(utterance);
};

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const resultTranscript = event.results[current][0].transcript;
        setTranscript(resultTranscript);
      };
      recognitionRef.current.onerror = (event) => {
        console.error("Mic Error:", event.error);
        setIsListening(false);
      };
    } else {
      console.warn("Speech Recognition API not supported in this browser");
    }
  }, []);

  const startListening = () => {
    setTranscript('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Mic already active or error starting:", e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return { isListening, transcript, startListening, stopListening, resetTranscript: () => setTranscript('') };
};
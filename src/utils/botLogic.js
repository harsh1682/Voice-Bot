// Use your Render backend, NOT localhost
const API_URL = 'https://voice-bot-p1kr.onrender.com/api/chat-ai';

export const generateBotResponse = async (input) => {
  try {
    console.log("📤 Frontend sending to Backend...", input);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to communicate with the AI Server");
    }

    const data = await response.json();
    return data.text;

  } catch (error) {
    console.error("❌ Frontend Logic Error:", error);
    throw error;
  }
};

import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEk-ySg0Tb4NWgCrIB7JaTV7HKhdka7SY",
  authDomain: "voice-bot-26432.firebaseapp.com",
  projectId: "voice-bot-26432",
  storageBucket: "voice-bot-26432.firebasestorage.app",
  messagingSenderId: "374926761088",
  appId: "1:374926761088:web:d32e897467c8c325249a65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const appId = 'voice-bot-default'; 
export const auth = getAuth(app);
export const db = getFirestore(app);
// Or your specific app ID logic


// Import and configure the Firebase SDK
// It is safe to expose this configuration to the public
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging/sw";

const firebaseConfig = {
  apiKey: "AIzaSyAd8T2SnKYd0lC464LCU8SPloORnCtf2f8",
  authDomain: "agrisence-1dc30.firebaseapp.com",
  projectId: "agrisence-1dc30",
  storageBucket: "agrisence-1dc30.firebasestorage.app",
  messagingSenderId: "948776556057",
  appId: "1:948776556057:web:59c34ba4ceffdd5901bc88",
  measurementId: "G-NZ199RVD5G"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// This service worker can be customized further if needed.
// For now, it will handle background notifications automatically.
console.log("Firebase Messaging Service Worker initialized.");


// Import the Firebase app and messaging libraries
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging/sw";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAd8T2SnKYd0lC464LCU8SPloORnCtf2f8",
  authDomain: "agrisence-1dc30.firebaseapp.com",
  projectId: "agrisence-1dc30",
  storageBucket: "agrisence-1dc30.appspot.com",
  messagingSenderId: "948776556057",
  appId: "1:948776556057:web:59c34ba4ceffdd5901bc88",
  measurementId: "G-NZ199RVD5G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Log to confirm the service worker is running
console.log("Firebase Messaging Service Worker initialized.");

// The service worker needs to be fairly empty.
// Background message handling would go here if needed.

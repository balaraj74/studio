
// This file needs to be in the public directory.

// Import the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging/sw";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAd8T2SnKYd0lC464LCU8SPloORnCtf2f8",
  authDomain: "agrisence-1dc30.firebaseapp.com",
  projectId: "agrisence-1dc30",
  storageBucket: "agrisence-1dc30.firebasestorage.app",
  messagingSenderId: "948776556057",
  appId: "1:948776556057:web:59c34ba4ceffdd5901bc88",
  measurementId: "G-NZ199RVD5G"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Background message handler (optional)
// self.addEventListener('push', (event) => {
//   console.log('[firebase-messaging-sw.js] Received background message ', event);
//   // Customize notification here
// });

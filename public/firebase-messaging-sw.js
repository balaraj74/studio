
// Import the Firebase app and messaging services.
// Note: This is a different import path than in your app's code.
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging/sw";

// IMPORTANT: This file needs to be in the `public` directory.

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

// Initialize the Firebase app in the service worker with the configuration
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app);

// The service worker doesn't need to do anything else.
// Firebase handles the background notifications automatically.
console.log("Firebase messaging service worker has been set up");

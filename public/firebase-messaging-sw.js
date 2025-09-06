// This service worker is required to show notifications when the app is in the background.

// Import and initialize the Firebase SDK
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: self.location.search.split('apiKey=')[1].split('&')[0],
  authDomain: self.location.search.split('authDomain=')[1].split('&')[0],
  projectId: self.location.search.split('projectId=')[1].split('&')[0],
  storageBucket: self.location.search.split('storageBucket=')[1].split('&')[0],
  messagingSenderId: self.location.search.split('messagingSenderId=')[1].split('&')[0],
  appId: self.location.search.split('appId=')[1].split('&')[0],
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/agrisence-logo.png' // Optional: Add a logo to your public folder
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

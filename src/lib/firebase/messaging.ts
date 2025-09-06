
'use client';

import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { app } from './config';

const firebaseConfig = {
  apiKey: "AIzaSyAd8T2SnKYd0lC464LCU8SPloORnCtf2f8",
  authDomain: "agrisence-1dc30.firebaseapp.com",
  projectId: "agrisence-1dc30",
  storageBucket: "agrisence-1dc30.firebasestorage.app",
  messagingSenderId: "948776556057",
  appId: "1:948776556057:web:59c34ba4ceffdd5901bc88",
  measurementId: "G-NZ199RVD5G"
};


// Function to construct the service worker URL with config params
const getServiceWorkerUrl = () => {
    const params = new URLSearchParams({
        apiKey: firebaseConfig.apiKey!,
        authDomain: firebaseConfig.authDomain!,
        projectId: firebaseConfig.projectId!,
        storageBucket: firebaseConfig.storageBucket!,
        messagingSenderId: firebaseConfig.messagingSenderId!,
        appId: firebaseConfig.appId!,
    }).toString();
    return `/firebase-messaging-sw.js?${params}`;
};

export const getFcmToken = async () => {
  let fcmToken = null;
  const isFcmSupported = await isSupported();
  // IMPORTANT: This is a public key, safe to include here.
  const vapidKey = "BKy-UaL9-3-sW_Gz5G_wDso9-y_SbYxAqncf27lJ3D-u-Y9j-tA6-i_lR-oGzM-pX_r-A6sB8cZ_eL-4KjY-jJk";

  if (!isFcmSupported) {
    console.log("Firebase Messaging is not supported in this browser.");
    return null;
  }
  
  try {
    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      const serviceWorkerUrl = getServiceWorkerUrl();
      const serviceWorkerRegistration = await navigator.serviceWorker.register(serviceWorkerUrl);

      // Wait for the service worker to be active.
      await navigator.serviceWorker.ready;

      fcmToken = await getToken(messaging, {
        vapidKey: vapidKey,
        serviceWorkerRegistration
      });
    } else {
      console.log('Unable to get permission to notify.');
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
  }

  return fcmToken;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    isSupported().then(supported => {
      if (supported) {
        const messaging = getMessaging(app);
        onMessage(messaging, (payload) => {
          resolve(payload);
        });
      }
    });
  });

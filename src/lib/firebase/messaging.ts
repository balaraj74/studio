
'use client';

import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { app } from './config';

export const getFcmToken = async () => {
  let fcmToken = null;
  const isFcmSupported = await isSupported();
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

  if (!isFcmSupported) {
    console.log("Firebase Messaging is not supported in this browser.");
    return null;
  }
  if (!vapidKey) {
    console.error("VAPID key is missing. Notifications will not work.");
    return null;
  }
  
  try {
    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      // Register the service worker and get the token
      const serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      
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


'use client';

import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { app } from './config';

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

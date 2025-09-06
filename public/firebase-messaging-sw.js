// Import the Firebase app and messaging modules
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Get the Firebase config from the query parameters
const urlParams = new URL(self.location).searchParams;
const firebaseConfig = {
    apiKey: urlParams.get('apiKey'),
    authDomain: urlParams.get('authDomain'),
    projectId: urlParams.get('projectId'),
    storageBucket: urlParams.get('storageBucket'),
    messagingSenderId: urlParams.get('messagingSenderId'),
    appId: urlParams.get('appId'),
};

// Initialize the Firebase app in the service worker
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Optional: You can add a background message handler here if you need to
// customize the notification that is shown to the user when the web app is in the background.
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/agrisence-logo.png' // Optional: Add a logo to your public folder
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

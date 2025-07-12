
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAuth, type Auth } from "firebase/auth";

// Your web app's Firebase configuration, as provided.
const firebaseConfig = {
  apiKey: "AIzaSyCnd63dfnoOxV-DxclWmmSEQjSC049L6bY",
  authDomain: "agrisence.firebaseapp.com",
  projectId: "agrisence",
  storageBucket: "agrisence.firebasestorage.app",
  messagingSenderId: "878440506403",
  appId: "1:878440506403:web:c704f2284762b6332abd96"
};


// Initialize Firebase for client-side usage
let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, db, storage, auth };

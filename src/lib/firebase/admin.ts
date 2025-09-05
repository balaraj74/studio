// This file is for server-side code only.
import { initializeApp, getApps, cert, type App, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import serviceAccount from '../../../serviceAccountKey.json';

let adminApp: App;
let adminDb: Firestore;

if (!getApps().length) {
  try {
    const serviceAccountConfig = serviceAccount as ServiceAccount;
    adminApp = initializeApp({
      credential: cert(serviceAccountConfig),
      databaseURL: `https://${serviceAccountConfig.project_id}.firebaseio.com`
    });
    adminDb = getFirestore(adminApp);
  } catch (error: any) {
    console.error("Firebase admin initialization error", error.stack);
    throw new Error("Could not initialize Firebase admin SDK");
  }
} else {
  adminApp = getApps()[0];
  adminDb = getFirestore(adminApp);
}

/**
 * Returns a server-side Firestore instance.
 */
export function getAdminDb() {
    return adminDb;
}

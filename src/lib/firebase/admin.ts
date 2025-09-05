
'use server';

import { initializeApp, getApps, cert, type App, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../../../serviceAccountKey.json';

let adminApp: App;
let adminDb: FirebaseFirestore.Firestore;

const serviceAccountConfig = serviceAccount as ServiceAccount;

// Your project ID from the service account key
const projectId = serviceAccountConfig.project_id;

if (!getApps().length) {
    adminApp = initializeApp({
        credential: cert(serviceAccountConfig),
        // Explicitly specify the database URL for the default database
        databaseURL: `https://${projectId}.firebaseio.com`
    });
} else {
    adminApp = getApps()[0];
}

adminDb = getFirestore(adminApp);

/**
 * Returns a server-side Firestore instance.
 */
export function getAdminDb() {
    return adminDb;
}

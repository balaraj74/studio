'use server';

import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../../../serviceAccountKey.json';

// Initialize the app only if it hasn't been initialized yet
if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount as ServiceAccount),
    });
}

const adminDb = getFirestore();

/**
 * Returns a server-side Firestore instance.
 */
export async function getAdminDb() {
    return adminDb;
}

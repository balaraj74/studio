'use server';

import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../../../serviceAccountKey.json';

let adminDb: FirebaseFirestore.Firestore;

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount as ServiceAccount),
    });
}
adminDb = getFirestore();

/**
 * Returns a server-side Firestore instance.
 */
export function getAdminDb() {
    return adminDb;
}

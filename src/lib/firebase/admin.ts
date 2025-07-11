import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../../../serviceAccountKey.json';

let adminDb: FirebaseFirestore.Firestore;

const serviceAccountConfig = serviceAccount as ServiceAccount;

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccountConfig),
    });
}
adminDb = getFirestore();

/**
 * Returns a server-side Firestore instance.
 */
export function getAdminDb() {
    return adminDb;
}


import { initializeApp, getApps, cert, type App, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../../../serviceAccountKey.json';

let adminApp: App;
let adminDb: FirebaseFirestore.Firestore;

const serviceAccountConfig = serviceAccount as ServiceAccount;

if (!getApps().length) {
    adminApp = initializeApp({
        credential: cert(serviceAccountConfig),
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

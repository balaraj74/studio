'use server';

import * as admin from 'firebase-admin';
import serviceAccount from '../../../serviceAccountKey.json';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };

export async function getAdminDb() {
    return adminDb;
};

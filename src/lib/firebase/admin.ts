'use server';

import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from '../../../serviceAccountKey.json';

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount as ServiceAccount),
    });
}

const adminDb = getFirestore();
const adminAuth = getAuth();

export { adminDb, adminAuth };

export async function getAdminDb() {
    return adminDb;
};

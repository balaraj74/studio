
'use server';

import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert, type App, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../../../serviceAccountKey.json';
import type { Harvest } from '@/types';


// --- Firebase Admin Initialization ---
let adminApp: App;
if (!getApps().length) {
    const serviceAccountConfig = serviceAccount as ServiceAccount;
    adminApp = initializeApp({
        credential: cert(serviceAccountConfig),
        databaseURL: `https://${serviceAccountConfig.project_id}.firebaseio.com`
    });
} else {
    adminApp = getApps()[0];
}
const db = getFirestore(adminApp);
// --- End Firebase Admin Initialization ---


export type HarvestFormInput = Omit<Harvest, 'id' | 'harvestDate'> & {
    harvestDate: string;
};

const harvestConverter = {
    toFirestore: (harvest: Omit<Harvest, 'id'>) => ({
        ...harvest,
        harvestDate: Timestamp.fromDate(new Date(harvest.harvestDate)),
    }),
    fromFirestore: (snapshot: FirebaseFirestore.DocumentSnapshot): Harvest => {
        const data = snapshot.data();
        if(!data) throw new Error("Document is empty");
        return {
            id: snapshot.id,
            cropId: data.cropId,
            cropName: data.cropName,
            quantity: data.quantity,
            unit: data.unit,
            notes: data.notes,
            harvestDate: (data.harvestDate as Timestamp).toDate(),
        };
    }
};

const getHarvestsCollection = (userId: string) => {
    return db.collection('users').doc(userId).collection('harvests');
}


export async function getHarvests(userId: string): Promise<Harvest[]> {
    if (!userId) return [];
    try {
        const harvestsCollection = getHarvestsCollection(userId);
        const q = harvestsCollection.orderBy("harvestDate", "desc");
        const querySnapshot = await q.get();
        return querySnapshot.docs.map(doc => harvestConverter.fromFirestore(doc));
    } catch (error) {
        console.error("Error fetching harvests: ", error);
        return [];
    }
}

export async function addHarvest(userId: string, data: HarvestFormInput) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const newHarvest: Omit<Harvest, 'id'> = {
            ...data,
            harvestDate: new Date(data.harvestDate),
        };
        const harvestsCollection = getHarvestsCollection(userId);
        await harvestsCollection.withConverter(harvestConverter).add(newHarvest);
        revalidatePath('/harvest');
        return { success: true };
    } catch (error) {
        console.error("Error adding harvest: ", error);
        return { success: false, error: 'Failed to add harvest.' };
    }
}

export async function updateHarvest(userId: string, id: string, data: HarvestFormInput) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const harvestRef = db.collection('users').doc(userId).collection('harvests').doc(id);
        const updatedHarvest: Omit<Harvest, 'id'> = {
            ...data,
            harvestDate: new Date(data.harvestDate),
        };
        await harvestRef.withConverter(harvestConverter).update(updatedHarvest);
        revalidatePath('/harvest');
        return { success: true };
    } catch (error) {
        console.error("Error updating harvest: ", error);
        return { success: false, error: 'Failed to update harvest.' };
    }
}

export async function deleteHarvest(userId: string, id: string) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        await db.collection('users').doc(userId).collection('harvests').doc(id).delete();
        revalidatePath('/harvest');
        return { success: true };
    } catch (error) {
        console.error("Error deleting harvest: ", error);
        return { success: false, error: 'Failed to delete harvest.' };
    }
}

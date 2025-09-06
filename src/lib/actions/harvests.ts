
'use server';

import { revalidatePath } from 'next/cache';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import type { Harvest } from '@/types';

// --- Firebase Admin Initialization ---
// This uses Application Default Credentials.
if (!getApps().length) {
  try {
    initializeApp();
  } catch (error: any) {
    console.error("Firebase admin initialization error", error.stack);
  }
}
const db = getFirestore();
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: `Failed to add harvest. Details: ${errorMessage}` };
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: `Failed to update harvest. Details: ${errorMessage}` };
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: `Failed to delete harvest. Details: ${errorMessage}` };
    }
}

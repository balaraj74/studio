'use server';

import { revalidatePath } from 'next/cache';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp, query, orderBy } from 'firebase/firestore';
import { getAdminDb } from '@/lib/firebase/admin';
import type { Harvest } from '@/types';

export type HarvestFormInput = Omit<Harvest, 'id' | 'harvestDate'> & {
    harvestDate: string;
};

const harvestConverter = {
    toFirestore: (harvest: Omit<Harvest, 'id'>) => ({
        ...harvest,
        harvestDate: Timestamp.fromDate(harvest.harvestDate),
    }),
    fromFirestore: (snapshot: any, options: any): Harvest => {
        const data = snapshot.data(options);
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

const getHarvestsCollection = async (userId: string) => {
    const db = await getAdminDb();
    return collection(db, 'users', userId, 'harvests').withConverter(harvestConverter);
}


export async function getHarvests(userId: string): Promise<Harvest[]> {
    if (!userId) return [];
    try {
        const harvestsCollection = await getHarvestsCollection(userId);
        const q = query(harvestsCollection, orderBy("harvestDate", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
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
        const harvestsCollection = await getHarvestsCollection(userId);
        await addDoc(harvestsCollection, newHarvest);
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
        const db = await getAdminDb();
        const harvestRef = doc(db, 'users', userId, 'harvests', id);
        const updatedHarvest: Omit<Harvest, 'id'> = {
            ...data,
            harvestDate: new Date(data.harvestDate),
        };
        const dataToUpdate = {
            ...updatedHarvest,
            harvestDate: Timestamp.fromDate(updatedHarvest.harvestDate),
        }
        await updateDoc(harvestRef, dataToUpdate);
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
        const db = await getAdminDb();
        await deleteDoc(doc(db, 'users', userId, 'harvests', id));
        revalidatePath('/harvest');
        return { success: true };
    } catch (error) {
        console.error("Error deleting harvest: ", error);
        return { success: false, error: 'Failed to delete harvest.' };
    }
}

'use server';

import { revalidatePath } from 'next/cache';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
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

const harvestsCollection = collection(db, 'harvests').withConverter(harvestConverter);

export async function getHarvests(): Promise<Harvest[]> {
    try {
        const q = query(harvestsCollection, orderBy("harvestDate", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error("Error fetching harvests: ", error);
        return [];
    }
}

export async function addHarvest(data: HarvestFormInput) {
    try {
        const newHarvest: Omit<Harvest, 'id'> = {
            ...data,
            harvestDate: new Date(data.harvestDate),
        };
        await addDoc(harvestsCollection, newHarvest);
        revalidatePath('/harvest');
        return { success: true };
    } catch (error) {
        console.error("Error adding harvest: ", error);
        return { success: false, error: 'Failed to add harvest.' };
    }
}

export async function updateHarvest(id: string, data: HarvestFormInput) {
    try {
        const harvestRef = doc(db, 'harvests', id);
        const updatedHarvest: Omit<Harvest, 'id'> = {
            ...data,
            harvestDate: new Date(data.harvestDate),
        };
        await updateDoc(harvestRef, harvestConverter.toFirestore(updatedHarvest));
        revalidatePath('/harvest');
        return { success: true };
    } catch (error) {
        console.error("Error updating harvest: ", error);
        return { success: false, error: 'Failed to update harvest.' };
    }
}

export async function deleteHarvest(id: string) {
    try {
        await deleteDoc(doc(db, 'harvests', id));
        revalidatePath('/harvest');
        return { success: true };
    } catch (error) {
        console.error("Error deleting harvest: ", error);
        return { success: false, error: 'Failed to delete harvest.' };
    }
}


'use server';

import { revalidatePath } from 'next/cache';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp, query, orderBy, type DocumentData, type Firestore } from 'firebase/firestore';
import { getAdminDb } from '@/lib/firebase/admin';
import type { Crop } from '@/types';

// This is the data shape for client-to-server communication, ensuring dates are strings.
export type CropFormInput = Omit<Crop, 'id' | 'plantedDate' | 'harvestDate'> & {
    plantedDate: string | null;
    harvestDate: string | null;
};


// Helper function to convert Firestore doc data to a Crop object
const docToCrop = (doc: DocumentData): Crop => {
    const data = doc.data();
    return {
        id: doc.id,
        name: data.name,
        status: data.status,
        notes: data.notes || null,
        plantedDate: data.plantedDate ? (data.plantedDate as Timestamp).toDate() : null,
        harvestDate: data.harvestDate ? (data.harvestDate as Timestamp).toDate() : null,
    };
};


const getCropsCollection = (db: Firestore, userId: string) => {
    return collection(db, 'users', userId, 'crops');
}

export async function getCrops(userId: string): Promise<Crop[]> {
    if (!userId) return [];
    try {
        const db = await getAdminDb();
        const cropsCollection = getCropsCollection(db, userId);
        const q = query(cropsCollection, orderBy("plantedDate", "desc"));
        const querySnapshot = await getDocs(q);
        const crops = querySnapshot.docs.map(docToCrop);
        return crops;
    } catch (error) {
        console.error("Error fetching crops: ", error);
        return [];
    }
}

export async function addCrop(userId: string, data: CropFormInput) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const db = await getAdminDb();
        const cropsCollection = getCropsCollection(db, userId);
        const dataToSave = {
            ...data,
            plantedDate: data.plantedDate ? Timestamp.fromDate(new Date(data.plantedDate)) : null,
            harvestDate: data.harvestDate ? Timestamp.fromDate(new Date(data.harvestDate)) : null,
        };
        await addDoc(cropsCollection, dataToSave);
        revalidatePath('/crops');
        return { success: true };
    } catch (error) {
        console.error("Error adding crop: ", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: `Failed to add crop. Details: ${errorMessage}` };
    }
}

export async function updateCrop(userId: string, id: string, data: CropFormInput) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const db = await getAdminDb();
        const cropRef = doc(db, 'users', userId, 'crops', id);
        
        const dataToUpdate = {
            ...data,
            plantedDate: data.plantedDate ? Timestamp.fromDate(new Date(data.plantedDate)) : null,
            harvestDate: data.harvestDate ? Timestamp.fromDate(new Date(data.harvestDate)) : null,
        };

        await updateDoc(cropRef, dataToUpdate as { [x: string]: any });
        revalidatePath('/crops');
        return { success: true };
    } catch (error) {
        console.error("Error updating crop: ", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: `Failed to update crop. Details: ${errorMessage}` };
    }
}

export async function deleteCrop(userId: string, id: string) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const db = await getAdminDb();
        const cropRef = doc(db, 'users', userId, 'crops', id);
        await deleteDoc(cropRef);
        revalidatePath('/crops');
        return { success: true };
    } catch (error) {
        console.error("Error deleting crop: ", error);
        return { success: false, error: 'Failed to delete crop.' };
    }
}

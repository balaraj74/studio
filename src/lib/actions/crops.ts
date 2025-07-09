'use server';

import { revalidatePath } from 'next/cache';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Crop } from '@/types';

// This is the data shape for client-to-server communication, ensuring dates are strings.
export type CropFormInput = Omit<Crop, 'id' | 'plantedDate' | 'harvestDate'> & {
    plantedDate: string | null;
    harvestDate: string | null;
};

// Firestore data converter to handle Date and Timestamp conversions.
const cropConverter = {
    toFirestore: (crop: Omit<Crop, 'id'>) => {
        return {
            ...crop,
            plantedDate: crop.plantedDate ? Timestamp.fromDate(crop.plantedDate) : null,
            harvestDate: crop.harvestDate ? Timestamp.fromDate(crop.harvestDate) : null,
        };
    },
    fromFirestore: (snapshot: any, options: any): Crop => {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            name: data.name,
            status: data.status,
            notes: data.notes,
            plantedDate: data.plantedDate ? (data.plantedDate as Timestamp).toDate() : null,
            harvestDate: data.harvestDate ? (data.harvestDate as Timestamp).toDate() : null,
        };
    }
};

const cropsCollection = collection(db, 'crops').withConverter(cropConverter);

export async function getCrops(): Promise<Crop[]> {
    try {
        const q = query(cropsCollection, orderBy("plantedDate", "desc"));
        const querySnapshot = await getDocs(q);
        const crops = querySnapshot.docs.map(doc => doc.data());
        return crops;
    } catch (error) {
        console.error("Error fetching crops: ", error);
        return [];
    }
}

export async function addCrop(data: CropFormInput) {
    try {
        const newCrop: Omit<Crop, 'id'> = {
            ...data,
            plantedDate: data.plantedDate ? new Date(data.plantedDate) : null,
            harvestDate: data.harvestDate ? new Date(data.harvestDate) : null,
        };
        await addDoc(cropsCollection, newCrop);
        revalidatePath('/crops');
        return { success: true };
    } catch (error) {
        console.error("Error adding crop: ", error);
        return { success: false, error: 'Failed to add crop.' };
    }
}

export async function updateCrop(id: string, data: CropFormInput) {
    try {
        const cropRef = doc(db, 'crops', id);
        // We can't just spread the data because we need to convert date strings to Date objects
        const updatedCropData: Omit<Crop, 'id'> = {
            name: data.name,
            status: data.status,
            notes: data.notes,
            plantedDate: data.plantedDate ? new Date(data.plantedDate) : null,
            harvestDate: data.harvestDate ? new Date(data.harvestDate) : null,
        };
        await updateDoc(cropRef, cropConverter.toFirestore(updatedCropData));
        revalidatePath('/crops');
        return { success: true };
    } catch (error) {
        console.error("Error updating crop: ", error);
        return { success: false, error: 'Failed to update crop.' };
    }
}

export async function deleteCrop(id: string) {
    try {
        const cropRef = doc(db, 'crops', id);
        await deleteDoc(cropRef);
        revalidatePath('/crops');
        return { success: true };
    } catch (error) {
        console.error("Error deleting crop: ", error);
        return { success: false, error: 'Failed to delete crop.' };
    }
}

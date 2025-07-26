
'use server';

import { revalidatePath } from 'next/cache';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp, query, orderBy, getDoc } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase/admin';
import type { Crop, CropTask } from '@/types';
import { generateCropCalendar, AIGeneratedTask } from '@/ai/flows/generate-crop-calendar';
import { parse, isValid, getYear } from 'date-fns';

// This is the data shape for client-to-server communication, ensuring dates are strings.
export type CropFormInput = Omit<Crop, 'id' | 'plantedDate' | 'harvestDate' | 'calendar'> & {
    plantedDate: string | null;
    harvestDate: string | null;
};


// Helper function to parse AI-generated date ranges into concrete dates
const parseDateRange = (range: string, year: number): { startDate: Date, endDate: Date } => {
    // Expected format: "Month Day" e.g., "July 10" or "July 1 - July 10"
    const parts = range.split(' - ').map(p => p.trim());
    
    // Attempt to parse with format "MMMM d"
    const parseWithYear = (dateStr: string) => {
        const fullDateStr = `${dateStr} ${year}`;
        let dt = parse(fullDateStr, 'MMMM d yyyy', new Date());
        // Fallback for abbreviated months like "Sept"
        if (!isValid(dt)) {
            dt = parse(fullDateStr, 'MMM d yyyy', new Date());
        }
        return dt;
    };
    
    const startDate = parseWithYear(parts[0]);
    const endDate = parts.length > 1 ? parseWithYear(parts[1]) : startDate;

    if (!isValid(startDate) || !isValid(endDate)) {
        console.warn(`Could not parse date range: "${range}". Using current date.`);
        const now = new Date();
        return { startDate: now, endDate: now };
    }

    return { startDate, endDate };
}


// Helper function to convert Firestore doc data to a Crop object
const docToCrop = (doc: FirebaseFirestore.DocumentSnapshot): Crop => {
    const data = doc.data();
    if (!data) throw new Error("Document data is empty");

    // Convert Firestore Timestamps in calendar to JS Dates
    const calendarTasks = (data.calendar || []).map((task: any) => ({
        ...task,
        startDate: task.startDate ? (task.startDate as Timestamp).toDate() : new Date(),
        endDate: task.endDate ? (task.endDate as Timestamp).toDate() : new Date(),
    }));

    return {
        id: doc.id,
        name: data.name,
        status: data.status,
        notes: data.notes || null,
        plantedDate: data.plantedDate ? (data.plantedDate as Timestamp).toDate() : null,
        harvestDate: data.harvestDate ? (data.harvestDate as Timestamp).toDate() : null,
        calendar: calendarTasks,
        region: data.region || null,
    };
};


const getCropsCollection = (db: FirebaseFirestore.Firestore, userId: string) => {
    return db.collection('users').doc(userId).collection('crops');
}

export async function getCrops(userId: string): Promise<Crop[]> {
    if (!userId) return [];
    try {
        const db = getAdminDb();
        const cropsCollection = getCropsCollection(db, userId);
        const q = query(cropsCollection, orderBy("plantedDate", "desc"));
        const querySnapshot = await q.get();
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
        const db = getAdminDb();
        const cropsCollection = getCropsCollection(db, userId);

        let calendar: CropTask[] = [];
        // 1. Generate calendar from AI if region is provided
        if (data.region && data.name) {
            try {
                const { tasks } = await generateCropCalendar({ cropName: data.name, region: data.region });
                // Use the year from plantedDate if available, otherwise use the current year
                const referenceDate = data.plantedDate ? new Date(data.plantedDate) : new Date();
                const calendarYear = getYear(referenceDate);

                calendar = tasks.map((task: AIGeneratedTask) => {
                    const { startDate, endDate } = parseDateRange(task.dateRange, calendarYear);
                    return {
                        taskName: task.taskName,
                        startDate,
                        endDate,
                        isCompleted: false, // Default to not completed
                    };
                });
            } catch (aiError) {
                console.error("Failed to generate crop calendar from AI:", aiError);
                // Don't fail the whole operation, just proceed without a calendar
            }
        }
        
        // 2. Prepare data for Firestore
        const dataToSave = {
            ...data,
            plantedDate: data.plantedDate ? Timestamp.fromDate(new Date(data.plantedDate)) : null,
            harvestDate: data.harvestDate ? Timestamp.fromDate(new Date(data.harvestDate)) : null,
            calendar: calendar.map(task => ({ // Convert dates back to Timestamps for saving
                ...task,
                startDate: Timestamp.fromDate(task.startDate),
                endDate: Timestamp.fromDate(task.endDate),
            })),
        };
        
        // 3. Add to Firestore
        await cropsCollection.add(dataToSave);

        revalidatePath('/crops');
        return { success: true };
    } catch (error) {
        console.error("Error adding crop: ", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: `Failed to add crop. Details: ${errorMessage}` };
    }
}

export async function updateCrop(userId: string, id: string, data: Partial<CropFormInput & { calendar: CropTask[] }>) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const db = getAdminDb();
        const cropRef = db.collection('users').doc(userId).collection('crops').doc(id);
        
        const dataToUpdate: { [key: string]: any } = {};

        // Iterate over the keys in the input data and build the update object.
        // This prevents trying to access properties that don't exist on `data`.
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const value = data[key as keyof typeof data];
                if (key === 'plantedDate' && value) {
                    dataToUpdate[key] = Timestamp.fromDate(new Date(value as string));
                } else if (key === 'harvestDate' && value) {
                    dataToUpdate[key] = Timestamp.fromDate(new Date(value as string));
                } else if (key === 'calendar' && Array.isArray(value)) {
                     dataToUpdate[key] = value.map(task => ({
                        ...task,
                        startDate: Timestamp.fromDate(new Date(task.startDate)),
                        endDate: Timestamp.fromDate(new Date(task.endDate)),
                    }));
                } else if (value !== undefined) {
                    dataToUpdate[key] = value;
                }
            }
        }
        
        if (Object.keys(dataToUpdate).length === 0) {
            return { success: true, message: "No changes to update." };
        }

        await cropRef.update(dataToUpdate);

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
        const db = getAdminDb();
        const cropRef = db.collection('users').doc(userId).collection('crops').doc(id);
        await cropRef.delete();
        revalidatePath('/crops');
        return { success: true };
    } catch (error) {
        console.error("Error deleting crop: ", error);
        return { success: false, error: 'Failed to delete crop.' };
    }
}

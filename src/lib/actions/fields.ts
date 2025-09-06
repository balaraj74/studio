
'use server';

import { revalidatePath } from 'next/cache';
import { getFirestore, GeoPoint } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert, type App, type ServiceAccount } from 'firebase-admin/app';
import serviceAccount from '../../../serviceAccountKey.json';
import type { Field } from '@/types';


// --- Firebase Admin Initialization ---
if (!getApps().length) {
  try {
    const serviceAccountConfig = serviceAccount as ServiceAccount;
    initializeApp({
      credential: cert(serviceAccountConfig),
    });
  } catch (error: any) {
    console.error("Firebase admin initialization error", error.stack);
  }
}
const db = getFirestore();
// --- End Firebase Admin Initialization ---


export type FieldFormInput = Omit<Field, 'id'>;

const fieldConverter = {
    fromFirestore: (snapshot: FirebaseFirestore.DocumentSnapshot): Field => {
        const data = snapshot.data();
        if(!data) throw new Error("Document is empty");
        
        const coordinates = (data.coordinates || []).map((gp: GeoPoint) => ({
            lat: gp.latitude,
            lng: gp.longitude,
        }));

        const centroid = data.centroid ? {
            lat: data.centroid.latitude,
            lng: data.centroid.longitude
        } : { lat: 0, lng: 0 };


        return {
            id: snapshot.id,
            fieldName: data.fieldName,
            surveyNumber: data.surveyNumber,
            village: data.village,
            area: data.area,
            perimeter: data.perimeter || 0,
            coordinates: coordinates,
            centroid: centroid,
            cropId: data.cropId || null,
            cropName: data.cropName || null,
        };
    }
};

const getFieldsCollection = (userId: string) => {
    return db.collection('users').doc(userId).collection('fields');
}

export async function getFields(userId: string): Promise<Field[]> {
    if (!userId) return [];
    try {
        const fieldsCollection = getFieldsCollection(userId);
        const q = fieldsCollection.orderBy("fieldName", "asc");
        const querySnapshot = await q.get();
        return querySnapshot.docs.map(doc => fieldConverter.fromFirestore(doc));
    } catch (error) {
        console.error("Error fetching fields: ", error);
        return [];
    }
}

const prepareDataForFirestore = (data: Partial<FieldFormInput>) => {
    const firestoreData: { [key: string]: any } = { ...data };
    
    if (data.coordinates) {
        firestoreData.coordinates = data.coordinates.map(coord => new GeoPoint(coord.lat, coord.lng));
    }
    if (data.centroid) {
        firestoreData.centroid = new GeoPoint(data.centroid.lat, data.centroid.lng);
    }
    
    return firestoreData;
}


export async function addField(userId: string, data: FieldFormInput) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const fieldsCollection = db.collection('users').doc(userId).collection('fields');
        
        const dataToSave = prepareDataForFirestore(data);

        await fieldsCollection.add(dataToSave);

        revalidatePath('/field-mapping');
        return { success: true };
    } catch (error) {
        console.error("Error adding field: ", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: `Failed to add field. Details: ${errorMessage}` };
    }
}

export async function updateField(userId: string, id: string, data: Partial<FieldFormInput>) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const fieldRef = db.collection('users').doc(userId).collection('fields').doc(id);
        
        const dataToUpdate = prepareDataForFirestore(data);

        await fieldRef.update(dataToUpdate);

        revalidatePath('/field-mapping');
        return { success: true };
    } catch (error) {
        console.error("Error updating field: ", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: `Failed to update field. Details: ${errorMessage}` };
    }
}

export async function deleteField(userId: string, id: string) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        await db.collection('users').doc(userId).collection('fields').doc(id).delete();
        revalidatePath('/field-mapping');
        return { success: true };
    } catch (error)
 {
        console.error("Error deleting field: ", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: `Failed to delete field. Details: ${errorMessage}` };
    }
}

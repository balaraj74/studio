
'use server';

import { revalidatePath } from 'next/cache';
import { getAdminDb } from '@/lib/firebase/admin';
import type { Field } from '@/types';
import { GeoPoint } from 'firebase-admin/firestore';


export type FieldFormInput = Omit<Field, 'id'>;

// Re-introducing the converter to safely handle data retrieval
const fieldConverter = {
    fromFirestore: (snapshot: FirebaseFirestore.DocumentSnapshot): Field => {
        const data = snapshot.data();
        if(!data) throw new Error("Document is empty");
        
        // Convert GeoPoint arrays back to LatLngLiteral arrays
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


const getFieldsCollection = (db: FirebaseFirestore.Firestore, userId: string) => {
    return db.collection('users').doc(userId).collection('fields');
}

export async function getFields(userId: string): Promise<Field[]> {
    if (!userId) return [];
    try {
        const db = getAdminDb();
        const fieldsCollection = getFieldsCollection(db, userId);
        const q = fieldsCollection.orderBy("fieldName", "asc");
        const querySnapshot = await q.get();
        return querySnapshot.docs.map(doc => fieldConverter.fromFirestore(doc));
    } catch (error) {
        console.error("Error fetching fields: ", error);
        return [];
    }
}

// Helper to prepare data for Firestore, converting LatLngLiteral to GeoPoint
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
        const db = getAdminDb();
        const fieldsCollection = getFieldsCollection(db, userId);
        
        // Manually prepare the data to ensure correct types for Firestore
        const dataToSave = prepareDataForFirestore(data);

        await fieldsCollection.add(dataToSave);

        revalidatePath('/field-mapping');
        return { success: true };
    } catch (error) {
        console.error("Error adding field: ", error);
        return { success: false, error: 'Failed to add field.' };
    }
}

export async function updateField(userId: string, id: string, data: Partial<FieldFormInput>) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const db = getAdminDb();
        const fieldRef = db.collection('users').doc(userId).collection('fields').doc(id);
        
        // Manually prepare the data for updating
        const dataToUpdate = prepareDataForFirestore(data);

        await fieldRef.update(dataToUpdate);

        revalidatePath('/field-mapping');
        return { success: true };
    } catch (error) {
        console.error("Error updating field: ", error);
        return { success: false, error: 'Failed to update field.' };
    }
}

export async function deleteField(userId: string, id: string) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const db = getAdminDb();
        await db.collection('users').doc(userId).collection('fields').doc(id).delete();
        revalidatePath('/field-mapping');
        return { success: true };
    } catch (error)
 {
        console.error("Error deleting field: ", error);
        return { success: false, error: 'Failed to delete field.' };
    }
}

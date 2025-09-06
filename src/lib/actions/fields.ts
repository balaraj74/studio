
'use client';

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, GeoPoint } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Field } from '@/types';

export type FieldFormInput = Omit<Field, 'id'>;

const docToField = (doc: any): Field => {
    const data = doc.data();
    const coordinates = (data.coordinates || []).map((gp: GeoPoint) => ({
        lat: gp.latitude,
        lng: gp.longitude,
    }));
    const centroid = data.centroid ? {
        lat: data.centroid.latitude,
        lng: data.centroid.longitude
    } : { lat: 0, lng: 0 };

    return {
        id: doc.id,
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
};

const getFieldsCollection = (userId: string) => {
    return collection(db, 'users', userId, 'fields');
}

export async function getFields(userId: string): Promise<Field[]> {
    if (!userId) return [];
    try {
        const fieldsCollection = getFieldsCollection(userId);
        const q = query(fieldsCollection, orderBy("fieldName", "asc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docToField);
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
        const fieldsCollection = getFieldsCollection(userId);
        const dataToSave = prepareDataForFirestore(data);
        await addDoc(fieldsCollection, dataToSave);
        return { success: true };
    } catch (error) {
        console.error("Error adding field: ", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to add field. Details: ${errorMessage}` };
    }
}

export async function updateField(userId: string, id: string, data: Partial<FieldFormInput>) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const fieldRef = doc(db, 'users', userId, 'fields', id);
        const dataToUpdate = prepareDataForFirestore(data);
        await updateDoc(fieldRef, dataToUpdate);
        return { success: true };
    } catch (error) {
        console.error("Error updating field: ", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to update field. Details: ${errorMessage}` };
    }
}

export async function deleteField(userId: string, id: string) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const fieldRef = doc(db, 'users', userId, 'fields', id);
        await deleteDoc(fieldRef);
        return { success: true };
    } catch (error) {
        console.error("Error deleting field: ", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to delete field. Details: ${errorMessage}` };
    }
}

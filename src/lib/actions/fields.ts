
'use server';

import { revalidatePath } from 'next/cache';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy, type Firestore } from 'firebase/firestore';
import { getAdminDb } from '@/lib/firebase/admin';
import type { Field } from '@/types';

export type FieldFormInput = Omit<Field, 'id'>;

const fieldConverter = {
    toFirestore: (field: Omit<Field, 'id'>) => {
        return field;
    },
    fromFirestore: (snapshot: any, options: any): Field => {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            fieldName: data.fieldName,
            surveyNumber: data.surveyNumber,
            village: data.village,
            area: data.area,
            coordinates: data.coordinates,
            centroid: data.centroid,
        };
    }
};

const getFieldsCollection = (db: Firestore, userId: string) => {
    return collection(db, 'users', userId, 'fields').withConverter(fieldConverter);
}

export async function getFields(userId: string): Promise<Field[]> {
    if (!userId) return [];
    try {
        const db = await getAdminDb();
        const fieldsCollection = getFieldsCollection(db, userId);
        const q = query(fieldsCollection, orderBy("fieldName", "asc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error("Error fetching fields: ", error);
        return [];
    }
}

export async function addField(userId: string, data: FieldFormInput) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const db = await getAdminDb();
        const fieldsCollection = getFieldsCollection(db, userId);
        await addDoc(fieldsCollection, data);
        revalidatePath('/field-mapping');
        return { success: true };
    } catch (error) {
        console.error("Error adding field: ", error);
        return { success: false, error: 'Failed to add field.' };
    }
}

export async function updateField(userId: string, id: string, data: FieldFormInput) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const db = await getAdminDb();
        const fieldRef = doc(db, 'users', userId, 'fields', id);
        await updateDoc(fieldRef, data as any);
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
        const db = await getAdminDb();
        await deleteDoc(doc(db, 'users', userId, 'fields', id));
        revalidatePath('/field-mapping');
        return { success: true };
    } catch (error) {
        console.error("Error deleting field: ", error);
        return { success: false, error: 'Failed to delete field.' };
    }
}

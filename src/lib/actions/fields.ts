
'use server';

import { revalidatePath } from 'next/cache';
import { getAdminDb } from '@/lib/firebase/admin';
import type { Field } from '@/types';

export type FieldFormInput = Omit<Field, 'id'>;

const fieldConverter = {
    toFirestore: (field: Omit<Field, 'id'>) => {
        return field;
    },
    fromFirestore: (snapshot: FirebaseFirestore.DocumentSnapshot): Field => {
        const data = snapshot.data();
        if(!data) throw new Error("Document is empty");
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

export async function addField(userId: string, data: FieldFormInput) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const db = getAdminDb();
        const fieldsCollection = getFieldsCollection(db, userId);
        await fieldsCollection.withConverter(fieldConverter).add(data);
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
        const db = getAdminDb();
        const fieldRef = db.collection('users').doc(userId).collection('fields').doc(id);
        await fieldRef.withConverter(fieldConverter).update(data);
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
    } catch (error) {
        console.error("Error deleting field: ", error);
        return { success: false, error: 'Failed to delete field.' };
    }
}

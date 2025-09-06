
'use server';

import { revalidatePath } from 'next/cache';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert, type App, type ServiceAccount } from 'firebase-admin/app';
import serviceAccount from '../../../serviceAccountKey.json';
import type { Expense } from '@/types';


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

export type ExpenseFormInput = Omit<Expense, 'id' | 'date'> & {
    date: string;
};

const expenseConverter = {
    toFirestore: (expense: Omit<Expense, 'id'>) => ({
        ...expense,
        date: Timestamp.fromDate(new Date(expense.date)),
    }),
    fromFirestore: (snapshot: FirebaseFirestore.DocumentSnapshot): Expense => {
        const data = snapshot.data();
        if(!data) throw new Error("Document is empty");
        return {
            id: snapshot.id,
            name: data.name,
            category: data.category,
            amount: data.amount,
            notes: data.notes,
            date: (data.date as Timestamp).toDate(),
        };
    }
};

const getExpensesCollection = (userId: string) => {
    return db.collection('users').doc(userId).collection('expenses');
}

export async function getExpenses(userId: string): Promise<Expense[]> {
    if (!userId) return [];
    try {
        const expensesCollection = getExpensesCollection(userId);
        const q = expensesCollection.orderBy("date", "desc");
        const querySnapshot = await q.get();
        return querySnapshot.docs.map(doc => expenseConverter.fromFirestore(doc));
    } catch (error) {
        console.error("Error fetching expenses: ", error);
        return [];
    }
}

export async function addExpense(userId: string, data: ExpenseFormInput) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const dataToSave = {
            ...data,
            date: Timestamp.fromDate(new Date(data.date)),
        };
        const expensesCollection = getExpensesCollection(userId);
        await expensesCollection.add(dataToSave);
        revalidatePath('/expenses');
        return { success: true };
    } catch (error) {
        console.error("Error adding expense: ", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: `Failed to add expense. Details: ${errorMessage}` };
    }
}

export async function updateExpense(userId: string, id: string, data: ExpenseFormInput) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const expenseRef = db.collection('users').doc(userId).collection('expenses').doc(id);
        const dataToUpdate = {
            ...data,
            date: Timestamp.fromDate(new Date(data.date))
        };
        await expenseRef.update(dataToUpdate);
        revalidatePath('/expenses');
        return { success: true };
    } catch (error) {
        console.error("Error updating expense: ", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: `Failed to update expense. Details: ${errorMessage}` };
    }
}

export async function deleteExpense(userId: string, id: string) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        await db.collection('users').doc(userId).collection('expenses').doc(id).delete();
        revalidatePath('/expenses');
        return { success: true };
    } catch (error) {
        console.error("Error deleting expense: ", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: `Failed to delete expense. Details: ${errorMessage}` };
    }
}

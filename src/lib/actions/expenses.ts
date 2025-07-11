'use server';

import { revalidatePath } from 'next/cache';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp, query, orderBy } from 'firebase/firestore';
import { getAdminDb } from '@/lib/firebase/admin';
import type { Expense } from '@/types';

export type ExpenseFormInput = Omit<Expense, 'id' | 'date'> & {
    date: string;
};

const expenseConverter = {
    toFirestore: (expense: Omit<Expense, 'id'>) => ({
        ...expense,
        date: Timestamp.fromDate(expense.date),
    }),
    fromFirestore: (snapshot: any, options: any): Expense => {
        const data = snapshot.data(options);
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
    const db = getAdminDb();
    return collection(db, 'users', userId, 'expenses').withConverter(expenseConverter);
}

export async function getExpenses(userId: string): Promise<Expense[]> {
    if (!userId) return [];
    try {
        const q = query(getExpensesCollection(userId), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error("Error fetching expenses: ", error);
        return [];
    }
}

export async function addExpense(userId: string, data: ExpenseFormInput) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const newExpense: Omit<Expense, 'id'> = {
            ...data,
            date: new Date(data.date),
        };
        await addDoc(getExpensesCollection(userId), newExpense);
        revalidatePath('/expenses');
        return { success: true };
    } catch (error) {
        console.error("Error adding expense: ", error);
        return { success: false, error: 'Failed to add expense.' };
    }
}

export async function updateExpense(userId: string, id: string, data: ExpenseFormInput) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const db = getAdminDb();
        const expenseRef = doc(db, 'users', userId, 'expenses', id);
        const updatedExpense: Omit<Expense, 'id'> = {
            ...data,
            date: new Date(data.date),
        };
        const dataToUpdate = {
            ...updatedExpense,
            date: Timestamp.fromDate(updatedExpense.date)
        };
        await updateDoc(expenseRef, dataToUpdate);
        revalidatePath('/expenses');
        return { success: true };
    } catch (error) {
        console.error("Error updating expense: ", error);
        return { success: false, error: 'Failed to update expense.' };
    }
}

export async function deleteExpense(userId: string, id: string) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const db = getAdminDb();
        await deleteDoc(doc(db, 'users', userId, 'expenses', id));
        revalidatePath('/expenses');
        return { success: true };
    } catch (error) {
        console.error("Error deleting expense: ", error);
        return { success: false, error: 'Failed to delete expense.' };
    }
}

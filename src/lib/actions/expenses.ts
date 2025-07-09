'use server';

import { revalidatePath } from 'next/cache';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
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

const expensesCollection = collection(db, 'expenses').withConverter(expenseConverter);

export async function getExpenses(): Promise<Expense[]> {
    try {
        const q = query(expensesCollection, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error("Error fetching expenses: ", error);
        return [];
    }
}

export async function addExpense(data: ExpenseFormInput) {
    try {
        const newExpense: Omit<Expense, 'id'> = {
            ...data,
            date: new Date(data.date),
        };
        await addDoc(expensesCollection, newExpense);
        revalidatePath('/expenses');
        return { success: true };
    } catch (error) {
        console.error("Error adding expense: ", error);
        return { success: false, error: 'Failed to add expense.' };
    }
}

export async function updateExpense(id: string, data: ExpenseFormInput) {
    try {
        const expenseRef = doc(db, 'expenses', id);
        const updatedExpense: Omit<Expense, 'id'> = {
            ...data,
            date: new Date(data.date),
        };
        await updateDoc(expenseRef, expenseConverter.toFirestore(updatedExpense));
        revalidatePath('/expenses');
        return { success: true };
    } catch (error) {
        console.error("Error updating expense: ", error);
        return { success: false, error: 'Failed to update expense.' };
    }
}

export async function deleteExpense(id: string) {
    try {
        await deleteDoc(doc(db, 'expenses', id));
        revalidatePath('/expenses');
        return { success: true };
    } catch (error) {
        console.error("Error deleting expense: ", error);
        return { success: false, error: 'Failed to delete expense.' };
    }
}

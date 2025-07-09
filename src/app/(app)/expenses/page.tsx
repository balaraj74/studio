
import { getExpenses } from "@/lib/actions/expenses";
import ExpensesPageClient from "./ExpensesPageClient";

export default async function ExpensesPage() {
    const expenses = await getExpenses();
    return <ExpensesPageClient expenses={expenses} />;
}

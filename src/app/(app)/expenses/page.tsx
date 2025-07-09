
import { initialExpenses } from "@/lib/data";
import ExpensesPageClient from "./ExpensesPageClient";

export default function ExpensesPage() {
    return <ExpensesPageClient initialExpenses={initialExpenses} />;
}

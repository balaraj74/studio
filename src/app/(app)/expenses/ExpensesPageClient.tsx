
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Plus, Pencil, Trash2, CalendarIcon, Receipt } from "lucide-react";
import type { Expense, ExpenseCategory } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { addExpense, updateExpense, deleteExpense, type ExpenseFormInput } from "@/lib/actions/expenses";


const categoryStyles: { [key in ExpenseCategory]: string } = {
  Seeds: "bg-green-100 text-green-800",
  Fertilizer: "bg-yellow-100 text-yellow-800",
  Labor: "bg-blue-100 text-blue-800",
  Equipment: "bg-orange-100 text-orange-800",
  Other: "bg-gray-100 text-gray-800",
};

export default function ExpensesPageClient({ expenses }: { expenses: Expense[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const { toast } = useToast();

  const summary = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const thisMonthExpenses = expenses
      .filter(exp => new Date(exp.date).getMonth() === new Date().getMonth())
      .reduce((sum, exp) => sum + exp.amount, 0);

    const categoryCounts = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
    }, {} as {[key in ExpenseCategory]: number});
    
    const topCategory = Object.keys(categoryCounts).length > 0 
      ? Object.entries(categoryCounts).sort((a,b) => b[1] - a[1])[0][0] as ExpenseCategory
      : null;

    return { totalExpenses, thisMonthExpenses, topCategory };
  }, [expenses]);


  const handleAddNew = () => {
    setEditingExpense(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsDialogOpen(true);
  };

  const handleDelete = async (expenseId: string) => {
    const result = await deleteExpense(expenseId);
    if (result.success) {
      toast({ title: "Expense deleted successfully." });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold font-headline">Expense Tracking</h1>
            <p className="text-muted-foreground">
              Track and manage your farming expenses
            </p>
          </div>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader>
                <CardTitle>Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">₹{summary.totalExpenses.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{expenses.length} expenses recorded</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>This Month</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">₹{summary.thisMonthExpenses.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Current month spending</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Top Category</CardTitle>
            </CardHeader>
            <CardContent>
                {summary.topCategory ? (
                    <>
                        <p className="text-3xl font-bold">{summary.topCategory}</p>
                        <p className="text-sm text-muted-foreground">Highest spending category</p>
                    </>
                ) : (
                    <>
                        <p className="text-xl font-semibold">No expenses</p>
                        <p className="text-sm text-muted-foreground">Add expenses to see insights</p>
                    </>
                )}
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>
            {expenses.length} expenses recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expense</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("border-transparent", categoryStyles[expense.category])}
                        >
                          {expense.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(expense.date, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ₹{expense.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(expense)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(expense.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-48">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Receipt className="h-12 w-12 text-muted-foreground" />
                        <h3 className="font-semibold">No expenses recorded yet</h3>
                        <p className="text-muted-foreground text-sm">Click "Add Expense" to start tracking.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ExpenseFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        expense={editingExpense}
      />
    </div>
  );
}

interface ExpenseFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  expense: Expense | null;
}

function ExpenseFormDialog({
  isOpen,
  onOpenChange,
  expense,
}: ExpenseFormDialogProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Other");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if(!name || !amount || !date) {
        toast({ variant: "destructive", title: "Error", description: "Please fill all required fields." });
        return;
    };
    
    setIsLoading(true);

    const expenseData: ExpenseFormInput = {
        name,
        category,
        amount: parseFloat(amount),
        date: date.toISOString(),
        notes,
    };

    const result = expense?.id ? await updateExpense(expense.id, expenseData) : await addExpense(expenseData);

    if (result.success) {
        toast({ title: `Expense ${expense ? "updated" : "added"} successfully.` });
        onOpenChange(false);
    } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
    }

    setIsLoading(false);
  };
  
  useState(() => {
    if (isOpen) {
      setName(expense?.name || "");
      setCategory(expense?.category || "Other");
      setAmount(expense?.amount.toString() || "");
      setDate(expense?.date ? new Date(expense.date) : new Date());
      setNotes(expense?.notes || "");
    }
  }, [isOpen, expense]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
          <DialogDescription>
            {expense
              ? "Update the details for your expense."
              : "Fill in the details for your new expense."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g. Urea fertilizer"
              disabled={isLoading}
            />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount (₹)
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              placeholder="e.g. 1500"
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select onValueChange={(v) => setCategory(v as ExpenseCategory)} value={category} disabled={isLoading}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Seeds">Seeds</SelectItem>
                <SelectItem value="Fertilizer">Fertilizer</SelectItem>
                <SelectItem value="Labor">Labor</SelectItem>
                <SelectItem value="Equipment">Equipment</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
              placeholder="Any additional notes..."
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function ExpensesPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Card className="w-full max-w-lg p-8">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <DollarSign className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl">Expense Tracking</CardTitle>
          <CardDescription>
            This feature is coming soon. Monitor your costs and manage your budget.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Stay tuned for updates!</p>
        </CardContent>
      </Card>
    </div>
  );
}

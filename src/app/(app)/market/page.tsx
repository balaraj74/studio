import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { marketPrices } from "@/lib/data";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function MarketPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">Market Prices</h1>
        <p className="text-muted-foreground">
          Track the latest Agriculture Produce Market Committee (APMC) prices for key crops.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crop Prices (per Quintal)</CardTitle>
          <CardDescription>
            The data shown is for demonstration purposes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Crop</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead className="text-right">Price (₹)</TableHead>
                  <TableHead className="text-right">Change (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketPrices.map((item) => (
                  <TableRow key={`${item.crop}-${item.region}`}>
                    <TableCell className="font-medium">{item.crop}</TableCell>
                    <TableCell>{item.region}</TableCell>
                    <TableCell className="text-right font-mono">{item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={item.change >= 0 ? "default" : "destructive"}
                        className={`${item.change >= 0 ? 'bg-green-500/20 text-green-700 hover:bg-green-500/30' : 'bg-red-500/20 text-red-700 hover:bg-red-500/30'}`}
                      >
                        <div className="flex items-center">
                          {item.change >= 0 ? (
                            <ArrowUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(item.change).toFixed(1)}%
                        </div>
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

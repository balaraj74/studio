"use client";

import { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, LineChart, TrendingUp } from "lucide-react";
import type { MarketPrice } from "@/types";

interface MarketPageClientProps {
  prices: MarketPrice[];
  states: string[];
  crops: string[];
}

export default function MarketPageClient({ prices, states, crops }: MarketPageClientProps) {
  const [stateFilter, setStateFilter] = useState("All");
  const [cropFilter, setCropFilter] = useState("All");

  const filteredPrices = useMemo(() => {
    return prices.filter((price) => {
      const stateMatch = stateFilter === "All" || price.region === stateFilter;
      const cropMatch = cropFilter === "All" || price.crop === cropFilter;
      return stateMatch && cropMatch;
    });
  }, [stateFilter, cropFilter, prices]);

  const summary = useMemo(() => {
    if (prices.length === 0) {
      return {
        highestPrice: null,
        biggestGainer: null,
      };
    }
    const highestPrice = prices.reduce((max, p) => (p.price > max.price ? p : max), prices[0]);
    const biggestGainer = prices.reduce((max, p) => (p.change > max.change ? p : max), prices[0]);

    return { highestPrice, biggestGainer };
  }, [prices]);


  return (
    <div className="space-y-6">
       <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <LineChart className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Market Prices</h1>
          <p className="text-muted-foreground">
            Track the latest Agriculture Produce Market Committee (APMC) prices.
          </p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Price Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summary.highestPrice ? (
              <>
                <div className="text-2xl font-bold">₹{summary.highestPrice.price.toLocaleString()} / Quintal</div>
                <p className="text-xs text-muted-foreground">
                  {summary.highestPrice.crop} in {summary.highestPrice.region}
                </p>
              </>
            ) : <p>No data available</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Biggest Gainer</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {summary.biggestGainer ? (
              <>
                <div className="text-2xl font-bold">+{summary.biggestGainer.change.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {summary.biggestGainer.crop} in {summary.biggestGainer.region}
                </p>
              </>
            ) : <p>No data available</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Prices</CardTitle>
           <CardDescription>
            Select a state or crop to narrow down the results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="state-filter" className="text-sm font-medium">State</label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger id="state-filter">
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="crop-filter" className="text-sm font-medium">Crop</label>
                <Select value={cropFilter} onValueChange={setCropFilter}>
                  <SelectTrigger id="crop-filter">
                    <SelectValue placeholder="Select a crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map((crop) => <SelectItem key={crop} value={crop}>{crop}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
          </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Crop Prices (per Quintal)</CardTitle>
          <CardDescription>
            Showing {filteredPrices.length} of {prices.length} records. Data is for demonstration.
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
                {filteredPrices.length > 0 ? (
                  filteredPrices.map((item) => (
                    <TableRow key={`${item.crop}-${item.region}`}>
                      <TableCell className="font-medium">{item.crop}</TableCell>
                      <TableCell>{item.region}</TableCell>
                      <TableCell className="text-right font-mono">{item.price.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={item.change >= 0 ? "default" : "destructive"}
                          className={`border-transparent ${item.change >= 0 ? 'bg-green-500/20 text-green-700 hover:bg-green-500/30' : 'bg-red-500/20 text-red-700 hover:bg-red-500/30'}`}
                        >
                          <div className="flex items-center">
                            {item.change >= 0 ? (
                              <ArrowUp className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDown className="h-3 w-3 mr-1" />
                            )}
                            {item.change.toFixed(1)}%
                          </div>
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                       No prices found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

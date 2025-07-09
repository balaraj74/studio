"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Scheme } from "@/types";
import Link from "next/link";
import { ArrowRight, BookOpen, ScrollText } from "lucide-react";

interface SchemesPageClientProps {
    schemes: Scheme[];
    states: string[];
    crops: string[];
}

export default function SchemesPageClient({ schemes, states, crops }: SchemesPageClientProps) {
  const [stateFilter, setStateFilter] = useState("All");
  const [cropFilter, setCropFilter] = useState("All");

  const filteredSchemes = useMemo(() => {
    return schemes.filter((scheme) => {
      const stateMatch =
        stateFilter === "All" ||
        scheme.state === "All" ||
        scheme.state === stateFilter;
      const cropMatch =
        cropFilter === "All" ||
        scheme.crop === "All" ||
        scheme.crop === cropFilter;
      return stateMatch && cropMatch;
    });
  }, [stateFilter, cropFilter, schemes]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <ScrollText className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Government Schemes</h1>
          <p className="text-muted-foreground">
            Discover central and state government schemes for farmers.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Schemes</CardTitle>
          <CardDescription>
            Select your state and crop to find relevant schemes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="state-filter" className="text-sm font-medium">
                State
              </label>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger id="state-filter">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="crop-filter" className="text-sm font-medium">
                Crop
              </label>
              <Select value={cropFilter} onValueChange={setCropFilter}>
                <SelectTrigger id="crop-filter">
                  <SelectValue placeholder="Select a crop" />
                </SelectTrigger>
                <SelectContent>
                  {crops.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4">Available Schemes ({filteredSchemes.length})</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSchemes.length > 0 ? (
            filteredSchemes.map((scheme, index) => (
                <Card key={index} className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg mt-1">
                        <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
                    </div>
                    <span>{scheme.name}</span>
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {scheme.state !== 'All' && <span className="text-xs bg-indigo-500/20 text-indigo-700 px-2 py-0.5 rounded-full">{scheme.state}</span>}
                        {scheme.crop !== 'All' && <span className="text-xs bg-green-500/20 text-green-700 px-2 py-0.5 rounded-full">{scheme.crop}</span>}
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{scheme.description}</p>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full" variant="outline">
                    <Link href={scheme.link} target="_blank" rel="noopener noreferrer">
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    </Button>
                </CardFooter>
                </Card>
            ))
            ) : (
            <div className="md:col-span-2 lg:col-span-3 text-center py-12 bg-card rounded-lg border">
                <p className="text-muted-foreground font-semibold">
                No schemes found for the selected filters.
                </p>
                <p className="text-sm text-muted-foreground mt-1">Try selecting "All" to broaden your search.</p>
            </div>
            )}
        </div>
      </div>
    </div>
  );
}


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
import { ArrowRight, BookOpen } from "lucide-react";

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
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">Government Schemes</h1>
        <p className="text-muted-foreground">
          Discover central and state government schemes for farmers.
        </p>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSchemes.length > 0 ? (
          filteredSchemes.map((scheme, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-start gap-2">
                  <BookOpen className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <span>{scheme.name}</span>
                </CardTitle>
                <div className="flex flex-wrap gap-2 pt-2">
                    {scheme.state !== 'All' && <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">{scheme.state}</span>}
                    {scheme.crop !== 'All' && <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{scheme.crop}</span>}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{scheme.description}</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={scheme.link} target="_blank" rel="noopener noreferrer">
                    Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3 text-center py-12">
            <p className="text-muted-foreground">
              No schemes found for the selected filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

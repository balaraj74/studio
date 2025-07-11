"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, ArrowRight, Info } from "lucide-react";
import Link from "next/link";

const karnatakaDistricts: { [key: string]: string[] } = {
    "Bagalkote": ["Badami", "Bagalkote", "Jamkhandi"],
    "Bengaluru Urban": ["Anekal", "Bengaluru East", "Bengaluru North"],
    "Belagavi": ["Athani", "Belagavi", "Gokak"],
    // Add more districts and taluks as needed
};

const statesData: { [key: string]: { name: string, url: string, districts?: { [key: string]: string[] } } } = {
    "karnataka": { 
        name: "Karnataka", 
        url: "https://landrecords.karnataka.gov.in/service2/RTC.aspx",
        districts: karnatakaDistricts
    },
    "maharashtra": { name: "Maharashtra", url: "https://bhulekh.mahabhumi.gov.in/" },
    "gujarat": { name: "Gujarat", url: "https://anyror.gujarat.gov.in/" },
    "uttar_pradesh": { name: "Uttar Pradesh", url: "https://upbhulekh.gov.in/" },
    // Add more states as needed
};

export default function LandRecordsPage() {
  const [selectedStateKey, setSelectedStateKey] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedTaluk, setSelectedTaluk] = useState("");
  
  const selectedState = statesData[selectedStateKey];
  const districts = selectedState?.districts ? Object.keys(selectedState.districts) : [];
  const taluks = selectedDistrict && selectedState?.districts ? selectedState.districts[selectedDistrict] : [];
  
  const canProceed = selectedState?.url;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Land Records</h1>
          <p className="text-muted-foreground">
            Find and view official land records from government portals.
          </p>
        </div>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>How it Works</AlertTitle>
        <AlertDescription>
          AgriSence helps you quickly access official government websites for land records. Select your state and enter your details, and we'll provide a direct link to the portal.
        </AlertDescription>
      </Alert>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Find Your Land Record (RTC/Pahani)</CardTitle>
          <CardDescription>
            Select your location to get a link to the official portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select onValueChange={setSelectedStateKey} value={selectedStateKey}>
              <SelectTrigger id="state">
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statesData).map(([key, data]) => (
                    <SelectItem key={key} value={key}>{data.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedState?.districts && (
             <>
                <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Select onValueChange={setSelectedDistrict} value={selectedDistrict} disabled={!districts.length}>
                    <SelectTrigger id="district">
                        <SelectValue placeholder="Select your district" />
                    </SelectTrigger>
                    <SelectContent>
                        {districts.map((district) => (
                            <SelectItem key={district} value={district}>{district}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="taluk">Taluk</Label>
                    <Select onValueChange={setSelectedTaluk} value={selectedTaluk} disabled={!taluks.length}>
                    <SelectTrigger id="taluk">
                        <SelectValue placeholder="Select your taluk" />
                    </SelectTrigger>
                    <SelectContent>
                         {taluks.map((taluk) => (
                            <SelectItem key={taluk} value={taluk}>{taluk}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
             </>
          )}

           <div className="space-y-2">
                <Label htmlFor="survey-number">Survey Number</Label>
                <Input id="survey-number" placeholder="Enter your survey number (optional)"/>
            </div>

        </CardContent>
        <CardFooter>
            <Button asChild disabled={!canProceed} className="w-full">
                <Link href={selectedState?.url || '#'} target="_blank" rel="noopener noreferrer">
                    Proceed to Government Portal <ArrowRight className="ml-2 h-4 w-4"/>
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

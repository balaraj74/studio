
'use client';

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  SlidersHorizontal,
  MoreHorizontal,
} from "lucide-react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const farms = [
    {
        name: "Cucumber Farm 13",
        earnings: "10,000 BDT/share",
        rate: "5.5%",
        duration: "4 Months",
        image: "https://placehold.co/100x100.png",
        dataAiHint: "woman holding vegetables"
    },
    {
        name: "Agriculture Farm 27",
        earnings: "10,000 BDT/share",
        rate: "5.5%",
        duration: "4 Months",
        image: "https://placehold.co/100x100.png",
        dataAiHint: "man holding vegetables"
    },
    {
        name: "Karolla Farm 18",
        earnings: "10,000 BDT/share",
        rate: "5.5%",
        duration: "4 Months",
        image: "https://placehold.co/100x100.png",
        dataAiHint: "corn field"
    },
    {
        name: "Enrichment Farm 7",
        earnings: "10,000 BDT/share",
        rate: "5.5%",
        duration: "4 Months",
        image: "https://placehold.co/100x100.png",
        dataAiHint: "farmer hat"
    },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      
      <Tabs defaultValue="regular" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid grid-cols-2 p-1 h-12 rounded-full">
            <TabsTrigger value="regular" className="rounded-full text-base">Regular</TabsTrigger>
            <TabsTrigger value="shariah" className="rounded-full text-base">Shariah</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>
        <TabsContent value="regular">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Active Farms</h2>
                <Button variant="link" className="text-primary">View all</Button>
            </div>
            <div className="space-y-4">
                {farms.map((farm, index) => (
                    <Card key={index} className="overflow-hidden shadow-md border-2">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="relative h-20 w-20 rounded-lg overflow-hidden">
                                <Image src={farm.image} alt={farm.name} layout="fill" objectFit="cover" data-ai-hint={farm.dataAiHint} />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg">{farm.name}</h3>
                                    <button><MoreHorizontal className="h-5 w-5 text-muted-foreground" /></button>
                                </div>
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <p>Earnings</p>
                                    <p>{farm.rate}</p>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <p className="text-primary font-semibold">{farm.earnings}</p>
                                    <p className="text-muted-foreground">{farm.duration}</p>
                                </div>
                                <Button className="w-full rounded-full mt-2 font-bold">Book Now</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </TabsContent>
        <TabsContent value="shariah">
            <p className="text-center text-muted-foreground p-8">Shariah farms will be shown here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

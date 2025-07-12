
'use client';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Star, Heart, User, MapPin, Share2, Search } from 'lucide-react';
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const plantingItems = [
    {
        title: "Spring Serenade Farming",
        author: "Robert Fox",
        location: "New York, USA",
        price: "22.00-400.00",
        rating: 4.8,
        image: "https://placehold.co/600x400.png",
        dataAiHint: "farmer soybean field",
    },
    {
        title: "Urban Oasis Nursery",
        author: "Jane Doe",
        location: "California, USA",
        price: "15.00-300.00",
        rating: 4.9,
        image: "https://placehold.co/600x400.png",
        dataAiHint: "vegetables harvest box",
    },
];


export default function PlantingPage() {
  return (
    <div className="space-y-6">
       <Tabs defaultValue="farming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 p-1 h-12 rounded-full">
            <TabsTrigger value="farming" className="rounded-full text-base">Farming</TabsTrigger>
            <TabsTrigger value="nursery" className="rounded-full text-base">Nursery</TabsTrigger>
        </TabsList>
        <TabsContent value="farming">
            <div className="relative my-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search here..." className="pl-10 h-12 rounded-full" />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <Share2 className="h-4 w-4 text-muted-foreground"/>
                </button>
            </div>
            <div className="space-y-6">
                {plantingItems.map((item, index) => (
                    <Card key={index} className="overflow-hidden shadow-lg rounded-2xl">
                        <CardContent className="p-0">
                           <div className="relative h-48 w-full">
                                <Image src={item.image} alt={item.title} layout="fill" objectFit="cover" data-ai-hint={item.dataAiHint} />
                                <div className="absolute top-3 left-3 bg-black/40 text-white p-1 px-2 rounded-full text-xs flex items-center gap-1 backdrop-blur-sm">
                                    <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                                    <span>{item.rating}</span>
                                </div>
                                 <button className="absolute top-3 right-3 bg-black/40 text-white p-2 rounded-full backdrop-blur-sm">
                                    <Heart className="w-5 h-5" />
                                </button>
                           </div>
                           <div className="p-4">
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <div className="flex justify-between text-muted-foreground text-sm mb-3">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        <span>{item.author}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>{item.location}</span>
                                    </div>
                                </div>
                                <p className="text-lg font-bold text-primary">${item.price}</p>
                           </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </TabsContent>
        <TabsContent value="nursery">
             <p className="text-center text-muted-foreground p-8">Nursery items will be shown here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const OldPage = () => (
    <div style={{display: 'none'}}>
        'use client';
        import Link from 'next/link';
        import {{
        Card,
        CardHeader,
        CardTitle,
        CardDescription,
        }} from '@/components/ui/card';
        import {{
        Stethoscope,
        CloudSun,
        LineChart,
        ScrollText,
        FileText,
        MapPin,
        ChevronRight,
        }} from 'lucide-react';
        import type {{ LucideIcon }} from 'lucide-react';

        interface ToolItem {{
        href: string;
        title: string;
        description: string;
        icon: LucideIcon;
        }}

        const toolItems: ToolItem[] = [
        {{
            href: '/disease-check',
            title: 'Crop Diagnosis',
            description: 'Identify crop diseases from images.',
            icon: Stethoscope,
        }},
        {{
            href: '/weather',
            title: 'Weather Forecast',
            description: 'Get real-time weather information.',
            icon: CloudSun,
        }},
        {{
            href: '/market',
            title: 'Market Prices',
            description: 'Track prices of key crops by region.',
            icon: LineChart,
        }},
        {{
            href: '/schemes',
            title: 'Government Schemes',
            description: 'Find relevant agricultural schemes.',
            icon: ScrollText,
        }},
        {{
            href: '/land-records',
            title: 'Land Records',
            description: 'Access official land record portals.',
            icon: FileText,
        }},
        {{
            href: '/fertilizer-finder',
            title: 'Fertilizer Finder',
            description: 'Locate nearby fertilizer shops.',
            icon: MapPin,
        }},
        ];

        export default function ToolsPage() {{
        return (
            <div className="space-y-4">
            {{toolItems.map((item) => (
                <Link href={{item.href}} key={{item.href}} className="block">
                <Card className="hover:bg-muted/50 active:scale-[0.98] transition-all">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <CardTitle>{{item.title}}</CardTitle>
                        <CardDescription>{{item.description}}</CardDescription>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                </Card>
                </Link>
            ))}}
            </div>
        );
        }}
    </div>
)

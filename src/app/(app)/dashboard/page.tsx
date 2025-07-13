
'use client';

import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Leaf,
  Stethoscope,
  CloudSun,
  LineChart,
  ScrollText,
  MessageCircle,
  Mic,
  Plus,
  BrainCircuit,
  FileText,
  MapPin,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { WeatherWidget } from '@/components/weather-widget';
import Image from 'next/image';

interface QuickLink {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const allTools: QuickLink[] = [
  {
    href: '/records',
    title: 'My Farm Records',
    description: 'Crops, expenses, and harvests.',
    icon: Leaf,
  },
  {
    href: '/disease-check',
    title: 'Crop Diagnosis',
    description: 'Diagnose diseases from images.',
    icon: Stethoscope,
  },
   {
    href: '/market',
    title: 'Market Prices',
    description: 'View latest prices for crops.',
    icon: LineChart,
  },
  {
    href: '/schemes',
    title: 'Govt. Schemes',
    description: 'Find agricultural schemes.',
    icon: ScrollText,
  },
  {
    href: '/weather',
    title: 'Weather',
    description: 'Get detailed local forecasts.',
    icon: CloudSun,
  },
  {
    href: '/land-records',
    title: 'Land Records',
    description: 'Access official land portals.',
    icon: FileText,
  },
  {
    href: '/fertilizer-finder',
    title: 'Fertilizer Finder',
    description: 'Locate nearby shops.',
    icon: MapPin,
  },
  {
    href: '/ai',
    title: 'AI Hub',
    description: 'Chat & voice assistants.',
    icon: BrainCircuit,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <p className="text-muted-foreground">Welcome Back,</p>
            <h1 className="text-2xl font-bold">
            {user?.displayName || 'Farmer'}
            </h1>
        </div>
        <div>
            {/* Search button can be added here */}
        </div>
      </div>
      
      <WeatherWidget />

      <div>
        <h2 className="text-lg font-semibold mb-3">All Tools</h2>
        <Carousel 
          opts={{
            align: "start",
            loop: false,
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {allTools.map((link) => (
              <CarouselItem key={link.href} className="pl-2 basis-2/5 md:basis-1/4">
                <Link href={link.href} className="block h-full">
                  <Card className="h-full bg-card/80 hover:bg-secondary/60 transition-colors active:scale-[0.98]">
                    <CardHeader className="p-4">
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className="p-3 bg-primary/20 rounded-lg">
                          <link.icon className="h-6 w-6 text-accent" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-sm">{link.title}</CardTitle>
                          <CardDescription className="text-xs">{link.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      
       <Card className="bg-gradient-to-br from-secondary/50 to-secondary/80">
        <CardHeader>
            <CardTitle>AI-Powered Assistants</CardTitle>
            <CardDescription className="text-muted-foreground">Get instant help using text or voice.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button asChild variant="ghost" className="justify-start gap-4 text-base py-6 flex-1 bg-background/50 hover:bg-background">
                <Link href="/chatbot">
                    <MessageCircle className="h-5 w-5 text-accent" />
                    <span>AI Chatbot</span>
                </Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start gap-4 text-base py-6 flex-1 bg-background/50 hover:bg-background">
                <Link href="/voice">
                    <Mic className="h-5 w-5 text-accent" />
                    <span>Voice Assistant</span>
                </Link>
            </Button>
        </CardContent>
       </Card>

    </div>
  );
}

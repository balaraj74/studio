
'use client';

import React from 'react';
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
} from "@/components/ui/carousel"
import {
  Leaf,
  Stethoscope,
  CloudSun,
  LineChart,
  ScrollText,
  BrainCircuit,
  FileText,
  MapPin,
  RefreshCw,
  Search,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { WeatherWidget } from '@/components/weather-widget';
import Autoplay from "embla-carousel-autoplay";
import Image from 'next/image';
import { Input } from '@/components/ui/input';

interface QuickLink {
  href: string;
  title: string;
  icon: LucideIcon;
}

const allTools: QuickLink[] = [
  {
    href: '/records',
    title: 'Records',
    icon: Leaf,
  },
  {
    href: '/disease-check',
    title: 'Diagnosis',
    icon: Stethoscope,
  },
   {
    href: '/market',
    title: 'Market',
    icon: LineChart,
  },
  {
    href: '/schemes',
    title: 'Schemes',
    icon: ScrollText,
  },
  {
    href: '/weather',
    title: 'Weather',
    icon: CloudSun,
  },
  {
    href: '/land-records',
    title: 'Land',
    icon: FileText,
  },
  {
    href: '/fertilizer-finder',
    title: 'Fertilizer',
    icon: MapPin,
  },
  {
    href: '/ai',
    title: 'AI Hub',
    icon: BrainCircuit,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const plugin = React.useRef(
    Autoplay({ delay: 2500, stopOnInteraction: true })
  );
  const date = new Date();
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold">
            Hello, {user?.displayName || 'Farmer'}
            </h1>
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
        <div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <RefreshCw className="h-5 w-5"/>
            </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search here..." className="pl-10 h-12 rounded-full bg-secondary text-base" />
      </div>
      
      <WeatherWidget />

      <div>
        <h2 className="text-lg font-semibold mb-3">Commodities and Food</h2>
        <Carousel 
          plugins={[plugin.current]}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent className="-ml-2">
            {allTools.map((link) => (
              <CarouselItem key={link.href} className="pl-3 basis-1/4">
                <Link href={link.href} className="block h-full">
                  <div className="h-full flex flex-col items-center justify-center text-center gap-2 p-2 bg-secondary rounded-2xl hover:bg-primary/20 transition-colors active:scale-[0.98]">
                      <link.icon className="h-7 w-7 text-primary" />
                      <p className="text-xs font-medium">{link.title}</p>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      
       <Card className="bg-secondary overflow-hidden">
        <CardHeader>
            <CardTitle>My Fields</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Link href="/field-mapping">
             <div className="relative h-40 w-full">
               <Image 
                src="https://firebasestudio.googleapis.com/v0/b/agrisence-1dc30.appspot.com/o/placeholders%2Ffield-aerial-view.png?alt=media&token=e937e2d5-4f74-4b82-9a4f-5570a2d5e386" 
                alt="My Field" 
                data-ai-hint="field aerial view"
                fill
                style={{ objectFit: 'cover' }}
                className="hover:scale-105 transition-transform duration-300"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
               <div className="absolute bottom-3 left-4 text-white">
                  <h4 className="font-bold text-lg">Olive Field</h4>
                  <p className="text-sm">Chianti Hills</p>
               </div>
             </div>
          </Link>
        </CardContent>
       </Card>

    </div>
  );
}

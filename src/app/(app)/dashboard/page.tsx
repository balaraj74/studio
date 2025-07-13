
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
  Leaf,
  Stethoscope,
  CloudSun,
  LineChart,
  ScrollText,
  MessageCircle,
  Mic,
  Plus,
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

const quickLinks: QuickLink[] = [
  {
    href: '/records',
    title: 'My Farm Records',
    description: 'Manage crops, expenses, and harvests.',
    icon: Leaf,
  },
  {
    href: '/disease-check',
    title: 'Crop Disease Check',
    description: 'Diagnose diseases from leaf images.',
    icon: Stethoscope,
  },
   {
    href: '/market',
    title: 'Market Prices',
    description: 'View latest prices for major crops.',
    icon: LineChart,
  },
  {
    href: '/schemes',
    title: 'Govt. Schemes',
    description: 'Find relevant agricultural schemes.',
    icon: ScrollText,
  },
];

const aiTools = [
    { href: '/chatbot', title: 'AI Chatbot', icon: MessageCircle },
    { href: '/voice', title: 'Voice Assistant', icon: Mic },
]

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
      
      <Card className="relative h-48 w-full overflow-hidden">
        <Image
            src="https://placehold.co/600x400.png"
            data-ai-hint="farm fields aerial"
            alt="Farm aerial view"
            layout="fill"
            objectFit="cover"
            className="opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <CardContent className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="text-lg font-semibold">GreenField</h2>
            <p className="text-sm text-muted-foreground">12 Active Tasks</p>
        </CardContent>
      </Card>
      
      <WeatherWidget />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {quickLinks.map((link) => (
          <Link href={link.href} key={link.href} className="block">
            <Card className="h-full bg-card/80 hover:bg-secondary/60 transition-colors active:scale-[0.98]">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <link.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{link.title}</CardTitle>
                    <CardDescription className="text-xs">{link.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
      
       <Card className="bg-gradient-to-br from-secondary/50 to-secondary/80">
        <CardHeader>
            <CardTitle>AI-Powered Assistants</CardTitle>
            <CardDescription className="text-muted-foreground">Get instant help using text or voice.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
            {aiTools.map(tool => (
                 <Button key={tool.href} asChild variant="ghost" className="justify-start gap-4 text-base py-6 flex-1 bg-background/50 hover:bg-background">
                    <Link href={tool.href}>
                        <tool.icon className="h-5 w-5 text-accent" />
                        <span>{tool.title}</span>
                    </Link>
                </Button>
            ))}
        </CardContent>
       </Card>

    </div>
  );
}

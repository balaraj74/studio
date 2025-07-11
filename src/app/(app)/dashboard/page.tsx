
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Stethoscope,
  LineChart,
  ScrollText,
  Leaf,
  Droplets,
  Wind,
  Sunrise,
  Sunset,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { useAuth } from '@/hooks/use-auth';

interface QuickAccessTool {
  title: string;
  href: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

const quickAccessTools: QuickAccessTool[] = [
  {
    title: "Crop Management",
    href: "/records",
    icon: Leaf,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Crop Diagnosis",
    href: "/disease-check",
    icon: Stethoscope,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    title: "Market Prices",
    href: "/market",
    icon: LineChart,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Govt. Schemes",
    href: "/schemes",
    icon: ScrollText,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
];


export default function DashboardPage() {
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Hello, Good Morning!</h1>
        <p className="text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Weather Card */}
      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg overflow-hidden">
        <CardContent className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                 <Image src="/weather-icon.png" alt="Weather" width={64} height={64} />
                 <div>
                    <p className="text-lg font-semibold">Bengaluru</p>
                    <p className="text-4xl font-bold">24°C</p>
                 </div>
            </div>
            <div className="text-right text-sm space-y-2">
                <div className="flex items-center gap-2 justify-end"><Droplets size={16}/> Humidity: 75%</div>
                <div className="flex items-center gap-2 justify-end"><Wind size={16}/> Wind: 12 km/h</div>
            </div>
        </CardContent>
        <div className="bg-black/10 px-4 py-2 text-xs flex justify-between items-center">
            <div className="flex items-center gap-1"><Sunrise size={14}/> 06:05 AM</div>
            <div className="font-semibold">Today is a good day to apply pesticides.</div>
            <div className="flex items-center gap-1"><Sunset size={14}/> 06:45 PM</div>
        </div>
      </Card>

      {/* Quick Access Tools */}
      <div>
        <h2 className="text-xl font-bold mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickAccessTools.map((tool) => (
            <Link href={tool.href} key={tool.title} className="block">
                <Card className="h-full bg-card hover:bg-muted/80 transition-colors flex flex-col items-center justify-center text-center p-4 aspect-square">
                <div className={`p-3 rounded-full mb-2 ${tool.bgColor}`}>
                    <tool.icon className={`h-6 w-6 ${tool.color}`} />
                </div>
                <p className="font-semibold text-sm leading-tight">{tool.title}</p>
                </Card>
            </Link>
            ))}
        </div>
      </div>
      
      {/* Best Offers */}
      <div>
        <div className="flex justify-between items-center mb-3">
             <h2 className="text-xl font-bold">Best Offers</h2>
             <Button variant="ghost" size="sm" asChild>
                <Link href="#">View all <ChevronRight className="h-4 w-4 ml-1"/></Link>
             </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <Card className="overflow-hidden">
                <div className="relative h-32 w-full">
                    <Image
                        src="https://placehold.co/600x400.png"
                        data-ai-hint="premium seeds farm"
                        alt="Premium Seeds"
                        fill
                        className="object-cover"
                    />
                </div>
                <CardHeader className="p-3">
                    <CardTitle className="text-base">Premium Seeds</CardTitle>
                </CardHeader>
            </Card>
             <Card className="overflow-hidden">
                <div className="relative h-32 w-full">
                    <Image
                        src="https://placehold.co/600x400.png"
                        data-ai-hint="farm drone"
                        alt="Drone Spraying"
                        fill
                        className="object-cover"
                    />
                </div>
                 <CardHeader className="p-3">
                    <CardTitle className="text-base">Drone Spraying</CardTitle>
                </CardHeader>
            </Card>
        </div>
      </div>

    </div>
  );
}

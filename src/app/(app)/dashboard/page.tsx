import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  Sun,
  Wind,
  Droplets,
  Gauge,
  Leaf,
  Stethoscope,
  LineChart,
  ScrollText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";

interface QuickAccessTool {
  title: string;
  href: string;
  icon: LucideIcon;
}

const quickAccessTools: QuickAccessTool[] = [
  {
    title: "Crop Management",
    href: "/crops",
    icon: Leaf,
  },
  {
    title: "Crop Diagnosis",
    href: "/disease-check",
    icon: Stethoscope,
  },
  {
    title: "Market Prices",
    href: "/market",
    icon: LineChart,
  },
  {
    title: "Govt. Schemes",
    href: "/schemes",
    icon: ScrollText,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-headline">Hello, Good Morning</h1>
        <p className="text-muted-foreground">Sunday, 01 Dec 2024</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Weather Card */}
          <Card className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-lg">
            <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <p className="font-medium">Chateauneuf-du-Pape</p>
                <div className="flex items-end gap-2 mt-2">
                    <p className="text-7xl font-bold leading-none">+17°</p>
                    <div className="text-sm font-light">
                        <p>H: 23°</p>
                        <p>L: 14°</p>
                    </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm mt-4 sm:mt-0">
                <div className="flex items-center gap-2"><Droplets size={16}/> Humidity: 40%</div>
                <div className="flex items-center gap-2"><Gauge size={16}/> Pressure: 450hPa</div>
                <div className="flex items-center gap-2"><Wind size={16}/> Wind: 23m/s</div>
              </div>
            </CardContent>
             <CardFooter className="p-6 pt-0">
                <div className="w-full flex items-center justify-between text-sm">
                    <span>5:25 am</span>
                    <div className="relative w-full max-w-xs h-8">
                        <div className="absolute top-1/2 left-0 w-full h-px bg-white/30"></div>
                        <div className="absolute -top-1 left-1/4 w-10 h-10 bg-yellow-300 rounded-full shadow-md"></div>
                    </div>
                    <span>8:04 am</span>
                </div>
             </CardFooter>
          </Card>

          {/* Quick Access Tools (Adapted from "Invest by Category") */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Quick Access</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickAccessTools.map((tool) => (
                <Link href={tool.href} key={tool.href}>
                  <Card className="h-full bg-card hover:bg-muted/80 transition-colors flex flex-col items-center justify-center text-center p-4">
                    <div className="p-3 bg-primary/10 rounded-full mb-2">
                        <tool.icon className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-semibold text-sm">{tool.title}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Side Column with Best Offers */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Best Offers</CardTitle>
                    <CardDescription>Check out the latest offers and services.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative h-40 w-full rounded-lg overflow-hidden">
                        <Image
                            src="https://placehold.co/600x400.png"
                            data-ai-hint="wheat field"
                            alt="Wheat field offer"
                            fill
                            className="object-cover"
                        />
                         <div className="absolute inset-0 bg-black/30 flex items-end p-4">
                            <h3 className="text-white font-bold">Premium Seeds</h3>
                        </div>
                    </div>
                    <div className="relative h-40 w-full rounded-lg overflow-hidden">
                        <Image
                            src="https://placehold.co/600x400.png"
                            data-ai-hint="farm drone"
                            alt="Drone service offer"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-end p-4">
                            <h3 className="text-white font-bold">Drone Spraying</h3>
                        </div>
                    </div>
                     <Button variant="outline" className="w-full">View all</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

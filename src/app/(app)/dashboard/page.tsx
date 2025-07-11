
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Loader2,
  FileText,
  MapPin,
  CloudSun,
  Bot,
  DollarSign,
  Package,
  Map,
  ClipboardList,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from "react";
import { getWeatherInfo, type GetWeatherInfoOutput } from "@/ai/flows/weather-search";
import { WeatherIcon } from "@/components/weather-icon";

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
    href: "/crops",
    icon: Leaf,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Expense Tracking",
    href: "/expenses",
    icon: DollarSign,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  {
    title: "Harvest Records",
    href: "/harvest",
    icon: Package,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    title: "Field Mapping",
    href: "/field-mapping",
    icon: Map,
    color: "text-lime-600",
    bgColor: "bg-lime-100",
  },
  {
    title: "Crop Diagnosis",
    href: "/disease-check",
    icon: Stethoscope,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    title: "Weather Forecast",
    href: "/weather",
    icon: CloudSun,
    color: "text-sky-600",
    bgColor: "bg-sky-100",
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
  {
    title: "Land Records",
    href: "/land-records",
    icon: FileText,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  {
    title: "Fertilizer Finder",
    href: "/fertilizer-finder",
    icon: MapPin,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
  {
    href: '/ai',
    title: 'AI Assistant',
    icon: Bot,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
];


export default function DashboardPage() {
  const [weatherData, setWeatherData] = useState<GetWeatherInfoOutput | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchWeather = () => {
        if (!navigator.geolocation) {
            console.warn("Geolocation is not supported by your browser.");
            setIsWeatherLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const result = await getWeatherInfo({ 
                        lat: position.coords.latitude, 
                        lon: position.coords.longitude 
                    });
                    setWeatherData(result);
                } catch (error) {
                    console.error("Failed to fetch weather data:", error);
                } finally {
                    setIsWeatherLoading(false);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                setIsWeatherLoading(false);
            }
        );
    };

    fetchWeather();
  }, []);

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
            {isWeatherLoading ? (
                 <div className="flex items-center gap-4 text-white w-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Loading weather data...</p>
                 </div>
            ) : weatherData ? (
                <>
                    <div className="flex items-center gap-4">
                        <WeatherIcon code={weatherData.current.weatherCode} className="w-16 h-16" />
                        <div>
                            <p className="text-lg font-semibold">{weatherData.location.name}</p>
                            <p className="text-4xl font-bold">{weatherData.current.temperature}°C</p>
                        </div>
                    </div>
                    <div className="text-right text-sm space-y-2">
                        <div className="flex items-center gap-2 justify-end"><Droplets size={16}/> Humidity: {weatherData.current.humidity}%</div>
                        <div className="flex items-center gap-2 justify-end"><Wind size={16}/> Wind: {weatherData.current.windSpeed} km/h</div>
                    </div>
                </>
            ) : (
                <div className="flex items-center gap-4 text-white">
                   <p>Could not load weather data. Please enable location access.</p>
                </div>
            )}
        </CardContent>
        <div className="bg-black/10 px-4 py-2 text-xs flex justify-between items-center">
            <div className="flex items-center gap-1"><Sunrise size={14}/> 06:05 AM</div>
            <div className="font-semibold text-center flex-1 px-2">{weatherData?.summary || "..."}</div>
            <div className="flex items-center gap-1"><Sunset size={14}/> 06:45 PM</div>
        </div>
      </Card>

      {/* Quick Access Tools */}
      <div>
        <div className="flex justify-between items-center mb-3">
             <h2 className="text-xl font-bold">Quick Access</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
    </div>
  );
}

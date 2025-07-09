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
  Leaf,
  BarChart2,
  DollarSign,
  Package,
  CloudSun,
  Stethoscope,
  ArrowRight,
} from "lucide-react";

const tools = [
  {
    title: "Farm Dashboard",
    description: "Visualize your farm's performance with charts and key metrics.",
    href: "/dashboard",
    icon: BarChart2,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Crop Management",
    description: "Track all your crops from sowing to harvest in one place.",
    href: "/crops",
    icon: Leaf,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Expense Tracking",
    description: "Monitor all your costs and manage your farm's budget.",
    href: "/expenses",
    icon: DollarSign,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    title: "Harvest Records",
    description: "Log your yields, track production, and manage inventory.",
    href: "/harvest",
    icon: Package,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Weather Tracking",
    description: "Get accurate forecasts and plan your activities accordingly.",
    href: "/weather",
    icon: CloudSun,
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
  },
  {
    title: "Crop Diagnosis",
    description: "Use your phone's camera to detect diseases in your crops.",
    href: "/disease-check",
    icon: Stethoscope,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="p-8 rounded-lg bg-card border shadow-sm">
        <h1 className="text-3xl font-bold font-headline text-foreground">Welcome back, Farmer!</h1>
        <p className="text-muted-foreground mt-2">
          Here's a quick overview of your farm. Let's make today a productive one.
        </p>
        <div className="mt-6 flex gap-4">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-bold">
            <Link href="/chatbot">
              Try AI Assistant
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard">
              View Dashboard
            </Link>
          </Button>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Comprehensive Farm Management Tools</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Card
              key={tool.href}
              className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${tool.bgColor} ${tool.color}`}
                >
                  <tool.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>{tool.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
              <div className="p-6 pt-0">
                <Button asChild className="w-full">
                  <Link href={tool.href}>
                    Open Tool
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

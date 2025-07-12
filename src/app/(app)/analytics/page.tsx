
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import Image from "next/image";

const growthData = [
  { name: 'Week 1', height: 2.0 },
  { name: 'Week 2', height: 4.5 },
  { name: 'Week 3', height: 7.0 },
  { name: 'Week 4', height: 9.5 },
];

const communityMembers = [
    {
        name: "Farming Community",
        owner: "Gun Hawkins",
        location: "New York, USA",
        image: "https://placehold.co/100x100.png",
        dataAiHint: "wheat field"
    },
    {
        name: "Agriculture Community",
        owner: "Gun Hawkins",
        location: "New York, USA",
        image: "https://placehold.co/100x100.png",
        dataAiHint: "tractor farm"
    },
    {
        name: "Farming Community",
        owner: "Gun Hawkins",
        location: "New York, USA",
        image: "https://placehold.co/100x100.png",
        dataAiHint: "rice paddy"
    },
    {
        name: "Agriculture Community",
        owner: "Gun Hawkins",
        location: "New York, USA",
        image: "https://placehold.co/100x100.png",
        dataAiHint: "farmer sunset"
    },
]

export default function StatisticPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">Growth</CardTitle>
            <Select defaultValue="weekly">
                <SelectTrigger className="w-[120px] rounded-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
             <AreaChart
                data={growthData}
                margin={{
                    top: 5,
                    right: 20,
                    left: -10,
                    bottom: 5,
                }}
                >
                <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis unit="cm" axisLine={false} tickLine={false} />
                <Tooltip 
                    contentStyle={{ 
                        borderRadius: '0.75rem', 
                        border: '1px solid hsl(var(--border))', 
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    }} 
                />
                <Area type="monotone" dataKey="height" stroke="hsl(var(--primary))" fill="url(#colorUv)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Community</h2>
            <Button variant="link" className="text-primary">View all</Button>
        </div>
         <div className="space-y-4">
            {communityMembers.map((member, index) => (
                <Card key={index}>
                    <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                                <Image src={member.image} alt={member.name} layout="fill" objectFit="cover" data-ai-hint={member.dataAiHint}/>
                            </div>
                            <div>
                                <h4 className="font-bold">{member.name}</h4>
                                <p className="text-sm text-muted-foreground">{member.owner} • {member.location}</p>
                            </div>
                        </div>
                        <Button variant="outline" className="rounded-full border-primary text-primary">Gabung</Button>
                    </CardContent>
                </Card>
            ))}
         </div>
      </div>
    </div>
  );
}

// Hiding old page, it will be removed later
const OldPage = () => <div style={{display: "none"}}><AnalyticsPageClient /></div>;
import AnalyticsPageClient from "./AnalyticsPageClient";

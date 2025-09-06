
'use client';

import { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  getSatelliteIntelligence,
  type GetSatelliteIntelligenceOutput,
} from '@/ai/flows/satellite-intelligence-flow';
import { Loader2, Satellite, Bot, MapPin, Leaf, ShieldAlert } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// A simple map component placeholder. In a real app, this would use Google Maps API.
const FieldMap = ({ boundaries }: { boundaries: { lat: number, lng: number }[] }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [isMapVisible, setIsMapVisible] = useState(false);

    // This is a simple SVG placeholder. A real implementation would use a mapping library.
    const renderMapPlaceholder = () => {
        if (boundaries.length === 0) return null;
        
        const latitudes = boundaries.map(p => p.lat);
        const longitudes = boundaries.map(p => p.lng);
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);

        const points = boundaries.map(p => 
            `${((p.lng - minLng) / (maxLng - minLng)) * 100},${100 - ((p.lat - minLat) / (maxLat - minLat)) * 100}`
        ).join(' ');

        return (
             <svg viewBox="0 0 100 100" className="w-full h-full rounded-lg border bg-muted/50">
                 <polygon points={points} style={{ fill: 'hsl(var(--primary) / 0.4)', stroke: 'hsl(var(--primary))', strokeWidth: 0.5 }} />
             </svg>
        );
    }
    
    return (
        <div className="aspect-video w-full">
            {renderMapPlaceholder()}
        </div>
    )
}

const HealthStatusCard = ({ status, summary }: { status: string, summary: string }) => {
    const colorClasses = {
        'Healthy': 'bg-green-500/20 text-green-400 border-green-500/30',
        'Mild Stress': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'Poor Health': 'bg-red-500/20 text-red-400 border-red-500/30',
    }[status] || 'bg-muted';

    return (
        <Card className={colorClasses}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Leaf /> Crop Health</CardTitle>
            </CardHeader>
            <CardContent>
                <p className={`text-2xl font-bold`}>{status}</p>
                <p className="text-sm text-muted-foreground">{summary}</p>
            </CardContent>
        </Card>
    );
}

const DiseaseHotspotCard = ({ hotspot }: { hotspot: GetSatelliteIntelligenceOutput['diseaseHotspots'][0] }) => {
     const colorClasses = {
        'Low': 'border-blue-500/30',
        'Medium': 'border-yellow-500/30',
        'High': 'border-red-500/30',
    }[hotspot.riskLevel] || 'border-muted';

    return (
         <Card className={colorClasses}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><ShieldAlert /> {hotspot.diseaseName}</CardTitle>
                 <CardDescription>Risk Level: {hotspot.riskLevel}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div>
                    <p className="font-semibold">Reason</p>
                    <p className="text-muted-foreground">{hotspot.reason}</p>
                </div>
                <div>
                    <p className="font-semibold">Suggested Action</p>
                    <p className="text-muted-foreground">{hotspot.suggestedAction}</p>
                </div>
            </CardContent>
        </Card>
    )
}

export default function FieldIntelligencePage() {
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<GetSatelliteIntelligenceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast({ variant: 'destructive', title: 'Please describe your field.' });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const analysisResult = await getSatelliteIntelligence({ fieldDescription: description });
      setResult(analysisResult);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'The AI could not generate a report. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Satellite className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Satellite Field Intelligence</h1>
          <p className="text-muted-foreground">Get AI-powered insights on your farm from satellite data.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleAnalyze}>
          <CardHeader>
            <CardTitle>Describe Your Field</CardTitle>
            <CardDescription>
              Enter a description of your field, including the crop, approximate size, and location.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., 'My 5-acre sugarcane field near Belgaum, Karnataka'"
              disabled={isLoading}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !description.trim()}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Bot className="mr-2 h-4 w-4" />
              )}
              {isLoading ? 'Analyzing...' : 'Generate Intelligence Report'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {isLoading && (
        <div className="space-y-6">
            <Skeleton className="h-10 w-2/3" />
            <div className="grid md:grid-cols-2 gap-6">
                <Skeleton className="aspect-video w-full" />
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in-50">
           <Alert>
                <Bot className="h-4 w-4" />
                <AlertTitle>AI Analysis Complete</AlertTitle>
                <AlertDescription>{result.overallSummary}</AlertDescription>
            </Alert>
            <div className="grid lg:grid-cols-2 gap-6">
                <div>
                     <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><MapPin /> Automated Field Boundary</h3>
                     <FieldMap boundaries={result.fieldBoundaries} />
                </div>
                <div className="space-y-4">
                    <HealthStatusCard status={result.cropHealth.status} summary={result.cropHealth.summary} />
                    {result.diseaseHotspots.map((hotspot, index) => (
                        <DiseaseHotspotCard key={index} hotspot={hotspot} />
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

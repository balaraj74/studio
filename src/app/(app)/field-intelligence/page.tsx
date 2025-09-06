
'use client';

import { useState, useRef, useEffect } from 'react';
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

const FieldMap = ({ boundaries, hotspots }: { boundaries: { lat: number, lng: number }[], hotspots: GetSatelliteIntelligenceOutput['diseaseHotspots'] }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const polygonRef = useRef<google.maps.Polygon | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

    const hotspotColors = {
        'Low': '#3b82f6', // blue
        'Medium': '#f59e0b', // amber
        'High': '#ef4444', // red
    };

    useEffect(() => {
        if (mapRef.current && !map) {
            const center = boundaries.reduce((acc, curr) => ({
                lat: acc.lat + curr.lat,
                lng: acc.lng + curr.lng,
            }), { lat: 0, lng: 0 });
            center.lat /= boundaries.length;
            center.lng /= boundaries.length;

            const newMap = new window.google.maps.Map(mapRef.current, {
                center,
                zoom: 16,
                mapTypeId: 'satellite',
                disableDefaultUI: true,
                zoomControl: true,
            });
            setMap(newMap);
            infoWindowRef.current = new window.google.maps.InfoWindow();
        }
    }, [mapRef, map, boundaries]);

    useEffect(() => {
        if (map && boundaries.length > 0) {
            if (polygonRef.current) {
                polygonRef.current.setMap(null);
            }
            
            const newPolygon = new google.maps.Polygon({
                paths: boundaries,
                strokeColor: 'hsl(var(--primary))',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: 'hsl(var(--primary))',
                fillOpacity: 0.35,
            });
            newPolygon.setMap(map);
            polygonRef.current = newPolygon;

            const bounds = new google.maps.LatLngBounds();
            boundaries.forEach(point => bounds.extend(point));

            // Clear previous markers
            markersRef.current.forEach(marker => marker.setMap(null));
            markersRef.current = [];

            // Add new markers for hotspots
            if (hotspots && hotspots.length > 0) {
                hotspots.forEach((hotspot, index) => {
                    // Simple logic to place markers inside the polygon
                    const pointIndex = Math.floor(index * (boundaries.length / hotspots.length));
                    const markerPosition = boundaries[pointIndex];
                    
                    const marker = new google.maps.Marker({
                        position: markerPosition,
                        map,
                        title: `${hotspot.riskLevel} Risk: ${hotspot.diseaseName}`,
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: hotspotColors[hotspot.riskLevel] || '#9ca3af',
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: 'white'
                        }
                    });

                    bounds.extend(markerPosition);

                    marker.addListener('click', () => {
                         if (infoWindowRef.current) {
                            const contentString = `
                                <div style="font-family: sans-serif; color: black; max-width: 200px;">
                                    <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 4px;">${hotspot.diseaseName}</h4>
                                    <p style="font-size: 0.8rem; margin-bottom: 8px;"><strong>Risk:</strong> ${hotspot.riskLevel}</p>
                                    <p style="font-size: 0.8rem; margin-bottom: 4px;"><strong>Reason:</strong> ${hotspot.reason}</p>
                                    <p style="font-size: 0.8rem;"><strong>Action:</strong> ${hotspot.suggestedAction}</p>
                                </div>
                            `;
                            infoWindowRef.current.setContent(contentString);
                            infoWindowRef.current.open(map, marker);
                        }
                    });

                    markersRef.current.push(marker);
                });
            }

            map.fitBounds(bounds);
        }
    }, [map, boundaries, hotspots]);

    return (
        <div ref={mapRef} className="aspect-video w-full rounded-lg bg-muted border" />
    );
};


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
                     <FieldMap boundaries={result.fieldBoundaries} hotspots={result.diseaseHotspots} />
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

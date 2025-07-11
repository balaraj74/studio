
"use client";

import { useState, useEffect, useRef } from 'react';
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Search, Compass, AlertCircle, Car, List } from 'lucide-react';

const MAP_ID = "AGRISENCE_FERTILIZER_MAP";

// Haversine formula to calculate distance
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

interface Shop {
  place_id: string;
  name?: string;
  vicinity?: string;
  geometry?: {
    location?: google.maps.LatLng;
  };
  distance: number;
}

function MapComponent({ center, shops, onMarkerClick }: { center: google.maps.LatLngLiteral, shops: Shop[], onMarkerClick: (shop: Shop) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom: 14,
        mapId: MAP_ID,
        disableDefaultUI: true,
        zoomControl: true,
      });
      setMap(newMap);
      
      // Add user location marker
      new google.maps.Marker({
        position: center,
        map: newMap,
        title: "Your Location",
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "white"
        }
      });
    }
  }, [ref, map, center]);

  useEffect(() => {
    if (map) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));
      const newMarkers: google.maps.Marker[] = [];

      shops.forEach(shop => {
        if (shop.geometry?.location) {
          const marker = new google.maps.Marker({
            position: shop.geometry.location,
            map,
            title: shop.name,
          });
          marker.addListener("click", () => onMarkerClick(shop));
          newMarkers.push(marker);
        }
      });
      setMarkers(newMarkers);
    }
  }, [map, shops, onMarkerClick]);

  return <div ref={ref} id="map" className="h-full w-full rounded-lg" />;
}

export default function FertilizerFinderPage() {
  const { toast } = useToast();
  const [status, setStatus] = useState<'idle' | 'locating' | 'fetching' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);

  useEffect(() => {
    // Log the current URL to help debug API key restrictions
    if (typeof window !== 'undefined') {
      console.log("DEBUG: Current URL for API key whitelisting:", window.location.href);
    }
  }, []);

  const handleFindShops = () => {
    setStatus('locating');
    setError(null);
    setShops([]);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        fetchShops(location);
      },
      () => {
        setError("Location access denied. Please enable location permissions for this site.");
        setStatus('error');
      }
    );
  };

  const fetchShops = (location: google.maps.LatLngLiteral) => {
    setStatus('fetching');
    const mapElement = document.createElement('div');
    const placesService = new window.google.maps.places.PlacesService(mapElement);
    const request: google.maps.places.PlaceSearchRequest = {
      location,
      radius: 5000, // 5km radius
      keyword: 'fertilizer shop',
    };

    placesService.nearbySearch(request, (results, searchStatus) => {
      if (searchStatus === google.maps.places.PlacesServiceStatus.OK && results) {
        if (results.length === 0) {
           setError("No fertilizer shops found within a 5km radius.");
           setStatus('error');
           return;
        }
        
        const shopsWithDistance = results.map(shop => ({
          ...shop,
          distance: getDistance(location.lat, location.lng, shop.geometry!.location!.lat(), shop.geometry!.location!.lng())
        })).sort((a,b) => a.distance - b.distance);
        
        setShops(shopsWithDistance as Shop[]);
        setStatus('success');
      } else {
        setError("Could not find nearby shops. Please try again later.");
        setStatus('error');
        console.error("PlacesService error:", searchStatus);
      }
    });
  };

  const handleNavigate = (shop: Shop) => {
    if (shop.geometry?.location) {
      const lat = shop.geometry.location.lat();
      const lng = shop.geometry.location.lng();
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, '_blank');
    } else {
        toast({
            variant: "destructive",
            title: "Navigation Error",
            description: "Location data for this shop is not available."
        });
    }
  };
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return (
        <div className="space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription>
                The Google Maps API Key is missing. Please add your key to the <code>.env</code> file to use this feature.
              </AlertDescription>
            </Alert>
        </div>
    );
  }

  const renderContent = () => {
    if (status === 'idle') {
      return (
        <div className="text-center">
          <Compass className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Find Fertilizer Shops</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Click the button to find shops near your current location.
          </p>
        </div>
      );
    }
    if (status === 'locating' || status === 'fetching') {
      return (
        <div className="space-y-4">
            <Skeleton className="h-[400px] w-full" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
      );
    }
    if (status === 'error') {
      return (
        <Alert variant="destructive" className="h-full flex flex-col justify-center items-center text-center">
          <AlertCircle className="h-8 w-8" />
          <AlertTitle className="mt-4 text-lg">An Error Occurred</AlertTitle>
          <AlertDescription className="mt-2">
            {error || 'Something went wrong. Please try again.'}
          </AlertDescription>
        </Alert>
      );
    }
    if (status === 'success' && userLocation) {
      return (
        <div className="h-[700px] w-full">
          <MapComponent center={userLocation} shops={shops} onMarkerClick={handleNavigate}/>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <MapPin className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Fertilizer Finder</h1>
          <p className="text-muted-foreground">
            Locate nearby fertilizer shops using Google Maps.
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Nearby Shops</CardTitle>
          <CardDescription>
            {status === 'idle' ? 'Find shops based on your location.' : 'Shops found near you.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleFindShops} disabled={status === 'locating' || status === 'fetching'}>
                <Search className="mr-2 h-4 w-4" />
                {status === 'locating' && 'Locating...'}
                {status === 'fetching' && 'Searching...'}
                {(status === 'idle' || status === 'error' || status === 'success') && 'Find Shops Near Me'}
            </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[450px] lg:h-auto lg:min-h-[500px] bg-muted rounded-lg flex items-center justify-center p-4">
             <Wrapper apiKey={apiKey} libraries={["places"]}>
                {renderContent()}
            </Wrapper>
        </div>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><List /> Results</CardTitle>
            <CardDescription>Click a shop to get directions.</CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'success' && shops.length > 0 ? (
                <ul className="space-y-4">
                    {shops.map(shop => (
                        <li key={shop.place_id}>
                           <Button 
                             variant="ghost" 
                             className="h-auto w-full p-3 text-left justify-between items-center"
                             onClick={() => handleNavigate(shop)}
                           >
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{shop.name}</p>
                                <p className="text-xs text-muted-foreground">{shop.vicinity}</p>
                                <p className="text-xs font-bold text-primary mt-1">{shop.distance.toFixed(2)} km away</p>
                            </div>
                            <Car className="h-5 w-5 text-muted-foreground ml-2"/>
                           </Button>
                        </li>
                    ))}
                </ul>
            ): (
                 <div className="text-center text-sm text-muted-foreground pt-10">
                    { (status === 'locating' || status === 'fetching') && <p>Loading results...</p> }
                    { (status === 'idle' || status === 'error') && <p>Shop list will appear here.</p>}
                 </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

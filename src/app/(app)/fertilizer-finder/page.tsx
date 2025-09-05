
"use client";

import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Search, Compass, AlertCircle, Car, List, X, Route, Clock } from 'lucide-react';
import { getDirections, type DirectionsResponse } from '@/ai/flows/get-directions-flow';

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

function MapComponent({
  center,
  shops,
  onMarkerClick,
  directions,
}: {
  center: google.maps.LatLngLiteral;
  shops: Shop[];
  onMarkerClick: (shop: Shop) => void;
  directions: google.maps.DirectionsResult | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

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
      
      // Initialize DirectionsRenderer
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
          suppressMarkers: true, // We'll handle our own markers
          polylineOptions: {
              strokeColor: '#D6AD60',
              strokeWeight: 6,
              strokeOpacity: 0.8,
          }
      });
    }
  }, [ref, map, center]);

  useEffect(() => {
    if (map) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));
      const newMarkers: google.maps.Marker[] = [];
      
      const shouldShowShopMarkers = !directions;

      if(shouldShowShopMarkers) {
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
      }
      setMarkers(newMarkers);
    }
  }, [map, shops, onMarkerClick, directions]);

  useEffect(() => {
    if (map && directionsRendererRef.current) {
        directionsRendererRef.current.setMap(map);
        if (directions) {
            directionsRendererRef.current.setDirections(directions);
        } else {
            directionsRendererRef.current.setDirections({ routes: [] });
        }
    }
  }, [map, directions]);


  return <div ref={ref} id="map" className="h-full w-full rounded-lg" />;
}

export default function FertilizerFinderPage() {
  const { toast } = useToast();
  const [status, setStatus] = useState<'idle' | 'locating' | 'fetching' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [apiKey, setApiKey] = useState<string | undefined>(undefined);

  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  }, []);

  const handleFindShops = () => {
    setStatus('locating');
    setError(null);
    setShops([]);
    clearNavigation();

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
        const shopsWithDistance = results.map(shop => ({
          ...shop,
          distance: getDistance(location.lat, location.lng, shop.geometry!.location!.lat(), shop.geometry!.location!.lng())
        })).sort((a,b) => a.distance - b.distance);
        
        setShops(shopsWithDistance as Shop[]);
        setStatus('success');
      } else if (searchStatus === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        setError("No fertilizer shops found within a 5km radius.");
        setStatus('error');
      } else {
        setError("Could not find nearby shops. Please try again later.");
        setStatus('error');
        console.error("PlacesService error:", searchStatus);
      }
    });
  };

  const handleShowRoute = async (shop: Shop) => {
    if (!userLocation || !shop.geometry?.location) {
        toast({ variant: 'destructive', title: 'Error', description: 'Cannot calculate route.'});
        return;
    }

    setSelectedShop(shop);
    setIsNavigating(true);
    
    try {
        const result = await getDirections({
            origin: userLocation,
            destination: shop.geometry.location.toJSON(),
        });
        
        // The result from our flow is already in the google.maps.DirectionsResult format
        setDirections(result as google.maps.DirectionsResult);

    } catch (err: any) {
        console.error('Directions request failed:', err);
        toast({ variant: 'destructive', title: 'Route not found', description: err.message || 'Could not calculate a route to this destination.' });
        clearNavigation();
    }
  };

  const clearNavigation = () => {
    setSelectedShop(null);
    setDirections(null);
    setIsNavigating(false);
  };

  const handleStartRide = () => {
    if (!selectedShop || !selectedShop.geometry?.location) return;
    const lat = selectedShop.geometry.location.lat();
    const lng = selectedShop.geometry.location.lng();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };
  
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
    if (status === 'locating' || (status === 'fetching' && !isNavigating)) {
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
    if ((status === 'success' || isNavigating) && userLocation) {
      return (
        <div className="h-[700px] w-full">
          <MapComponent center={userLocation} shops={shops} onMarkerClick={handleShowRoute} directions={directions}/>
        </div>
      );
    }
    return null;
  }
  
  const tripInfo = directions?.routes[0]?.legs[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <MapPin className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Fertilizer Finder</h1>
          <p className="text-muted-foreground">
            Locate nearby fertilizer shops and view routes.
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Nearby Shops</CardTitle>
          <CardDescription>
            {isNavigating ? 'Navigating to your selected shop.' : 'Find shops based on your location.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
            {isNavigating ? (
                <Button onClick={clearNavigation} variant="destructive-outline">
                    <X className="mr-2 h-4 w-4" /> Clear Route
                </Button>
            ) : (
                <Button onClick={handleFindShops} disabled={status === 'locating' || status === 'fetching' || !apiKey}>
                    <Search className="mr-2 h-4 w-4" />
                    {status === 'locating' && 'Locating...'}
                    {status === 'fetching' && 'Searching...'}
                    {(status === 'idle' || status === 'error' || status === 'success') && 'Find Shops Near Me'}
                </Button>
            )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[450px] lg:h-auto lg:min-h-[500px] bg-muted rounded-lg flex items-center justify-center p-4">
             {!apiKey && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Configuration Error</AlertTitle>
                    <AlertDescription>
                    The Google Maps API Key is missing. Please add it to the <code>.env</code> file as <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to use this feature.
                    </AlertDescription>
                </Alert>
             )}
             {apiKey && renderContent()}
        </div>
        <div className="lg:col-span-1">
            {isNavigating && selectedShop && tripInfo ? (
                 <Card className="animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle>Trip to {selectedShop.name}</CardTitle>
                        <CardDescription>{selectedShop.vicinity}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-primary flex items-center justify-center gap-2"><Route className="h-5 w-5"/>{tripInfo.distance?.text}</p>
                            <p className="text-xs text-muted-foreground">Distance</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-primary flex items-center justify-center gap-2"><Clock className="h-5 w-5"/>{tripInfo.duration?.text}</p>
                            <p className="text-xs text-muted-foreground">Duration</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button className="w-full" onClick={handleStartRide}>
                            <Car className="mr-2 h-4 w-4" /> Start Ride
                        </Button>
                    </CardFooter>
                 </Card>
            ) : (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><List /> Results</CardTitle>
                        <CardDescription>Click a shop to show the route.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {status === 'success' && shops.length > 0 ? (
                            <ul className="space-y-4">
                                {shops.map(shop => (
                                    <li key={shop.place_id}>
                                    <Button 
                                        variant="ghost" 
                                        className="h-auto w-full p-3 text-left justify-between items-center"
                                        onClick={() => handleShowRoute(shop)}
                                    >
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">{shop.name}</p>
                                            <p className="text-xs text-muted-foreground">{shop.vicinity}</p>
                                            <p className="text-xs font-bold text-primary mt-1">{shop.distance.toFixed(2)} km away</p>
                                        </div>
                                        <Route className="h-5 w-5 text-muted-foreground ml-2"/>
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
            )}
        </div>
      </div>

    </div>
  );
}

    
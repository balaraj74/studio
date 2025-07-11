
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Map as MapIcon, Plus, AlertCircle, Trash2, Pencil, Save, X, Redo, Pin, List, Edit, Trash } from 'lucide-react';
import type { Field } from '@/types';
import { getFields, addField, updateField, deleteField } from '@/lib/actions/fields';

const MAP_ID = "AGRISENCE_FIELD_MAP";
const ACRES_PER_SQ_METER = 0.000247105;

// #region Helper Functions
function calculatePolygonArea(coordinates: google.maps.LatLngLiteral[]): number {
    if (coordinates.length < 3) return 0;
    const path = coordinates.map(coord => new google.maps.LatLng(coord.lat, coord.lng));
    const areaInSqMeters = google.maps.geometry.spherical.computeArea(path);
    return areaInSqMeters * ACRES_PER_SQ_METER;
}

function calculatePolygonCentroid(coordinates: google.maps.LatLngLiteral[]): google.maps.LatLngLiteral {
    if (coordinates.length === 0) return { lat: 0, lng: 0 };
    const bounds = new google.maps.LatLngBounds();
    coordinates.forEach(coord => bounds.extend(coord));
    const center = bounds.getCenter();
    return center.toJSON();
}
// #endregion

// #region MapComponent
function MapComponent({ center, fields, onPolygonComplete, activeFieldId, onFieldClick, initialPolygon }: {
    center: google.maps.LatLngLiteral,
    fields: Field[],
    onPolygonComplete: (polygon: google.maps.Polygon) => void,
    activeFieldId: string | null,
    onFieldClick: (fieldId: string) => void,
    initialPolygon?: google.maps.LatLngLiteral[]
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map>();
    const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager>();
    const drawnPolygonsRef = useRef<Map<string, google.maps.Polygon>>(new Map());

    // Initialize map
    useEffect(() => {
        if (ref.current && !map) {
            const newMap = new window.google.maps.Map(ref.current, {
                center,
                zoom: 15,
                mapId: MAP_ID,
                mapTypeId: 'satellite',
                disableDefaultUI: true,
                zoomControl: true,
                mapTypeControl: true,
            });
            setMap(newMap);
        }
    }, [ref, map, center]);

    // Initialize drawing manager
    useEffect(() => {
        if (map && !drawingManager) {
            const manager = new google.maps.drawing.DrawingManager({
                drawingMode: google.maps.drawing.OverlayType.POLYGON,
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: [google.maps.drawing.OverlayType.POLYGON],
                },
                polygonOptions: {
                    fillColor: '#74B72E',
                    fillOpacity: 0.5,
                    strokeWeight: 2,
                    strokeColor: '#FFFFFF',
                    clickable: false,
                    editable: true,
                    zIndex: 1,
                },
            });
            manager.setMap(map);
            setDrawingManager(manager);

            google.maps.event.addListener(manager, 'polygoncomplete', (polygon: google.maps.Polygon) => {
                onPolygonComplete(polygon);
                manager.setDrawingMode(null); // Exit drawing mode
            });
        }
    }, [map, drawingManager, onPolygonComplete]);
    
     // Render initial polygon for editing
    useEffect(() => {
        if (map && initialPolygon && initialPolygon.length > 0) {
            const existingPolygon = new google.maps.Polygon({
                paths: initialPolygon,
                fillColor: '#74B72E',
                fillOpacity: 0.5,
                strokeWeight: 2,
                strokeColor: '#FFFFFF',
                clickable: false,
                editable: true,
                zIndex: 1,
            });
            existingPolygon.setMap(map);
            onPolygonComplete(existingPolygon);
        }
    }, [map, initialPolygon, onPolygonComplete]);


    // Draw saved fields on map
    useEffect(() => {
        if (map) {
            // Clear old polygons
            drawnPolygonsRef.current.forEach(p => p.setMap(null));
            drawnPolygonsRef.current.clear();

            fields.forEach(field => {
                const isSelected = field.id === activeFieldId;
                const polygon = new google.maps.Polygon({
                    paths: field.coordinates,
                    fillColor: isSelected ? '#D6AD60' : '#74B72E',
                    fillOpacity: isSelected ? 0.7 : 0.4,
                    strokeWeight: 2,
                    strokeColor: '#FFFFFF',
                    clickable: true,
                    zIndex: isSelected ? 3 : 2,
                });
                polygon.setMap(map);
                google.maps.event.addListener(polygon, 'click', () => {
                    onFieldClick(field.id);
                });
                drawnPolygonsRef.current.set(field.id, polygon);
            });
        }
    }, [map, fields, onFieldClick, activeFieldId]);


    return <div ref={ref} id="map" className="h-full w-full rounded-lg" />;
}
// #endregion

// #region Main Component
export default function FieldMappingClient() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [apiKey, setApiKey] = useState<string | undefined>(undefined);
    const [fields, setFields] = useState<Field[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral>({ lat: 20.5937, lng: 78.9629 }); // Default to India center
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingField, setEditingField] = useState<Field | null>(null);
    const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    // Set API key on client
    useEffect(() => {
        setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
    }, []);

    // Get user's current location once
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            () => {
                // Keep default location if user denies access
                console.log("Location access denied by user.");
            },
            { enableHighAccuracy: true }
        );
    }, []);

    // Fetch saved fields from Firestore
    useEffect(() => {
        async function fetchFields() {
            if (user) {
                setIsLoading(true);
                const fetchedFields = await getFields(user.uid);
                setFields(fetchedFields);
                setIsLoading(false);
            }
        }
        fetchFields();
    }, [user]);
    
    const refreshFields = useCallback(async () => {
        if (user) {
            const fetchedFields = await getFields(user.uid);
            setFields(fetchedFields);
        }
    }, [user]);

    const handleAddNew = () => {
        setEditingField(null);
        setActiveFieldId(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (field: Field) => {
        setEditingField(field);
        setActiveFieldId(field.id);
        setIsDialogOpen(true);
    };

    const handleDelete = async (fieldId: string) => {
        if (!user || !confirm("Are you sure you want to delete this field?")) return;
        const result = await deleteField(user.uid, fieldId);
        if (result.success) {
            toast({ title: "Field deleted successfully." });
            refreshFields();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    };
    
    const handleFieldClick = (fieldId: string) => {
        setActiveFieldId(fieldId);
        const field = fields.find(f => f.id === fieldId);
        if (field && mapRef.current) {
            mapRef.current.panTo(field.centroid);
            mapRef.current.setZoom(17);
        }
    };


    const renderWrapperContent = () => {
        return (
            <div className="h-[calc(100vh-20rem)] lg:h-full w-full">
                <MapComponent 
                    center={userLocation} 
                    fields={fields}
                    activeFieldId={activeFieldId}
                    onFieldClick={handleFieldClick}
                    onPolygonComplete={() => {}} // This is handled inside the dialog
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg"><MapIcon className="h-8 w-8 text-primary" /></div>
                <div>
                    <h1 className="text-3xl font-bold font-headline">Field Mapping</h1>
                    <p className="text-muted-foreground">Draw, measure, and manage your field boundaries.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-full bg-muted rounded-lg flex items-center justify-center">
                    {!apiKey ? (
                        <Alert variant="destructive" className="m-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Configuration Error</AlertTitle>
                            <AlertDescription>
                                Google Maps API Key is missing. Please add it to your environment variables.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        renderWrapperContent()
                    )}
                </div>

                <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2"><List /> My Fields</CardTitle>
                            <CardDescription>Your saved field boundaries.</CardDescription>
                        </div>
                        <Button size="sm" onClick={handleAddNew}><Plus className="mr-2 h-4 w-4"/> Add Field</Button>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-14 w-full" />
                                <Skeleton className="h-14 w-full" />
                                <Skeleton className="h-14 w-full" />
                            </div>
                        ) : fields.length > 0 ? (
                            <ul className="space-y-2">
                                {fields.map(field => (
                                    <li key={field.id}>
                                        <div
                                            onClick={() => handleFieldClick(field.id)}
                                            className={`p-3 rounded-md cursor-pointer border-2 transition-colors ${activeFieldId === field.id ? 'border-primary bg-primary/10' : 'bg-muted/50 hover:bg-muted'}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{field.fieldName}</p>
                                                    <p className="text-sm text-muted-foreground">Survey #: {field.surveyNumber}</p>
                                                    <p className="text-sm text-muted-foreground">{field.area.toFixed(2)} acres</p>
                                                </div>
                                                <div className="flex items-center flex-shrink-0">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleEdit(field); }}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(field.id); }}>
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-10">
                                <Pin className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-medium">No Fields Saved</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Click "Add Field" to draw your first boundary.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <FieldFormDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                field={editingField}
                onFormSubmit={refreshFields}
                center={userLocation}
                apiKey={apiKey}
            />
        </div>
    );
}
// #endregion

// #region FormDialog Component
interface FieldFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  field: Field | null;
  onFormSubmit: () => void;
  center: google.maps.LatLngLiteral;
  apiKey?: string;
}

function FieldFormDialog({ isOpen, onOpenChange, field, onFormSubmit, center, apiKey }: FieldFormDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [fieldName, setFieldName] = useState('');
    const [surveyNumber, setSurveyNumber] = useState('');
    const [village, setVillage] = useState('');
    const [area, setArea] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const drawnPolygonRef = useRef<google.maps.Polygon | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFieldName(field?.fieldName || '');
            setSurveyNumber(field?.surveyNumber || '');
            setVillage(field?.village || '');
            setArea(field?.area || 0);
            drawnPolygonRef.current = null;
        }
    }, [isOpen, field]);

    const handlePolygonComplete = useCallback((polygon: google.maps.Polygon) => {
        // Clear previous polygon if any
        if (drawnPolygonRef.current) {
            drawnPolygonRef.current.setMap(null);
        }
        drawnPolygonRef.current = polygon;
        updateArea();

        // Listen for edits
        google.maps.event.addListener(polygon.getPath(), 'set_at', updateArea);
        google.maps.event.addListener(polygon.getPath(), 'insert_at', updateArea);

    }, []);

    const updateArea = () => {
        if (drawnPolygonRef.current) {
            const path = drawnPolygonRef.current.getPath().getArray().map(p => p.toJSON());
            const calculatedArea = calculatePolygonArea(path);
            setArea(calculatedArea);
        }
    }

    const handleResetDrawing = () => {
        if(drawnPolygonRef.current) {
            drawnPolygonRef.current.setMap(null);
            drawnPolygonRef.current = null;
        }
        setArea(0);
    }
    
    const handleSubmit = async () => {
        if (!fieldName || !surveyNumber || !village) {
            toast({ variant: 'destructive', title: "Missing Details", description: "Please fill in all field details." });
            return;
        }
        if (!drawnPolygonRef.current) {
            toast({ variant: 'destructive', title: "No Boundary", description: "Please draw the field boundary on the map." });
            return;
        }
        if (!user) {
            toast({ variant: 'destructive', title: "Authentication Error" });
            return;
        }

        setIsSubmitting(true);
        
        const coordinates = drawnPolygonRef.current.getPath().getArray().map(p => p.toJSON());
        const centroid = calculatePolygonCentroid(coordinates);

        const fieldData = {
            fieldName,
            surveyNumber,
            village,
            area,
            coordinates,
            centroid
        };

        const result = field ? await updateField(user.uid, field.id, fieldData) : await addField(user.uid, fieldData);

        if (result.success) {
            toast({ title: `Field ${field ? 'updated' : 'saved'} successfully.` });
            onFormSubmit();
            onOpenChange(false);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{field ? 'Edit Field Boundary' : 'Add New Field'}</DialogTitle>
                    <DialogDescription>Draw the boundary on the map and enter the field details.</DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100%-8rem)]">
                    <div className="md:col-span-2 h-full rounded-lg bg-muted flex items-center justify-center">
                        {isOpen && apiKey && (
                                <MapComponent 
                                    center={field?.centroid || center} 
                                    fields={[]}
                                    onPolygonComplete={handlePolygonComplete}
                                    activeFieldId={null}
                                    onFieldClick={() => {}}
                                    initialPolygon={field?.coordinates}
                                />
                        )}
                         {isOpen && !apiKey && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>API Key Error</AlertTitle>
                                <AlertDescription>
                                    The Google Maps API key is not configured. The map cannot be loaded.
                                </AlertDescription>
                            </Alert>
                         )}
                    </div>
                    <div className="md:col-span-1 space-y-4 flex flex-col">
                        <Card>
                            <CardHeader><CardTitle>Field Details</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-1">
                                    <Label htmlFor="fieldName">Field Name</Label>
                                    <Input id="fieldName" value={fieldName} onChange={(e) => setFieldName(e.target.value)} placeholder="e.g., North Field" disabled={isSubmitting} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="surveyNumber">Survey Number</Label>
                                    <Input id="surveyNumber" value={surveyNumber} onChange={(e) => setSurveyNumber(e.target.value)} placeholder="e.g., 123/4A" disabled={isSubmitting} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="village">Village</Label>
                                    <Input id="village" value={village} onChange={(e) => setVillage(e.target.value)} placeholder="e.g., Rampur" disabled={isSubmitting} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="flex-grow">
                             <CardHeader><CardTitle>Area Measurement</CardTitle></CardHeader>
                             <CardContent className="text-center">
                                <p className="text-4xl font-bold text-primary">{area.toFixed(3)}</p>
                                <p className="text-muted-foreground">acres</p>
                             </CardContent>
                             <CardFooter>
                                <Button variant="outline" className="w-full" onClick={handleResetDrawing} disabled={isSubmitting}>
                                    <Redo className="mr-2 h-4 w-4"/> Clear Drawing
                                </Button>
                             </CardFooter>
                        </Card>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}><X className="mr-2 h-4 w-4"/> Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : <><Save className="mr-2 h-4 w-4"/> Save Field</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
// #endregion

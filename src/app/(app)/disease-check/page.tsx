
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wand2, RefreshCw, Stethoscope, ImagePlus, X, LocateFixed, BadgePercent, ShieldCheck, ListOrdered, TestTube2, Sprout, Leaf } from "lucide-react";
import Image from "next/image";
import {
  diagnoseCropDisease,
  type DiagnoseCropDiseaseOutput,
} from "@/ai/flows/crop-disease-detection";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

const MAX_IMAGES = 5;

export default function DiseaseCheckPage() {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [result, setResult] = useState<DiagnoseCropDiseaseOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Clean up preview URLs when component unmounts
    return () => {
      previewUrls.forEach(URL.revokeObjectURL);
    };
  }, [previewUrls]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const newFiles = [...imageFiles, ...files].slice(0, MAX_IMAGES);
    const newUrls = newFiles.map(file => URL.createObjectURL(file));

    // Revoke old URLs
    previewUrls.forEach(URL.revokeObjectURL);

    setImageFiles(newFiles);
    setPreviewUrls(newUrls);
    setResult(null);
    setError(null);
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    const newUrls = [...previewUrls];
    
    newFiles.splice(index, 1);
    const removedUrl = newUrls.splice(index, 1)[0];
    URL.revokeObjectURL(removedUrl);

    setImageFiles(newFiles);
    setPreviewUrls(newUrls);
  }

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const handleGetLocation = () => {
      if (!navigator.geolocation) {
          setError("Geolocation is not supported by your browser.");
          return;
      }
      setStatusText("Getting location...");
      navigator.geolocation.getCurrentPosition(
          (position) => {
              setLocation({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
              });
              setStatusText("Location found!");
              toast({ title: "Location Acquired", description: "Your current location has been recorded for analysis." });
          },
          () => {
              setError("Permission to access location was denied. Please enable it in your browser settings.");
              setStatusText("");
          }
      );
  }

  const handleDiagnose = async () => {
    if (imageFiles.length === 0 || !location) {
      setError("Please provide at least one image and your location.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      setStatusText("Converting images...");
      const imageUris = await Promise.all(imageFiles.map(fileToDataUri));
      
      setStatusText("Contacting weather service...");
      // The flow will handle weather, we just call the main diagnose function
      
      setStatusText("Analyzing with AI...");
      const diagnosisResult = await diagnoseCropDisease({ 
          imageUris,
          geolocation: location
      });

      if (!diagnosisResult.plantIdentification.isPlant) {
        setError("The AI could not identify a plant in the uploaded images. Please try again with a clearer picture.");
        setIsLoading(false);
        return;
      }

      setResult(diagnosisResult);
      setStatusText("Diagnosis complete!");

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to get diagnosis. ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Diagnosis Failed",
        description: "There was a problem contacting the AI service. Please try again later.",
      });
    } finally {
      setIsLoading(false);
      setStatusText("");
    }
  };
  
  const handleReset = () => {
    setImageFiles([]);
    previewUrls.forEach(URL.revokeObjectURL);
    setPreviewUrls([]);
    setLocation(null);
    setResult(null);
    setError(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Stethoscope className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Advanced Crop Diagnosis</h1>
          <p className="text-muted-foreground">
            Upload leaf images for a detailed AI analysis and identification.
          </p>
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
            <CardHeader>
            <CardTitle>1. Provide Inputs</CardTitle>
            <CardDescription>
                Add up to 5 clear leaf images and your location.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleGetLocation}
                    disabled={isLoading || !!location}
                >
                    <LocateFixed className="mr-2 h-4 w-4" />
                    {location ? `Location Acquired (${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)})` : "Get Current Location"}
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pictures">Leaf Images ({imageFiles.length}/{MAX_IMAGES})</Label>
                <div className="grid grid-cols-3 gap-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square">
                          <Image src={url} alt={`Preview ${index}`} fill className="rounded-md object-cover"/>
                           <Button
                              size="icon"
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                              onClick={() => removeImage(index)}
                              disabled={isLoading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                      </div>
                    ))}
                    {imageFiles.length < MAX_IMAGES && (
                      <Label
                        htmlFor="pictures"
                        className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"
                      >
                        <ImagePlus className="h-8 w-8 text-muted-foreground" />
                        <Input
                          id="pictures"
                          type="file"
                          multiple
                          className="hidden"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                          disabled={isLoading}
                        />
                      </Label>
                    )}
                </div>
              </div>

            {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            </CardContent>
            <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleReset} disabled={isLoading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
            </Button>
            <Button onClick={handleDiagnose} disabled={imageFiles.length === 0 || !location || isLoading}>
                {isLoading ? (
                <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {statusText || "Diagnosing..."}
                </>
                ) : (
                <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Diagnose
                </>
                )}
            </Button>
            </CardFooter>
        </Card>

        <div className="lg:col-span-3">
            {result ? (
            <Card className="animate-in fade-in-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Sprout className="text-primary" />
                      </div>
                      <span>{result.plantIdentification.plantName}</span>
                    </CardTitle>
                    <CardDescription>
                        Disease Diagnosis: {result.diseaseDiagnosis.diseaseName}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                          <Label className="flex items-center gap-2 text-muted-foreground"><BadgePercent className="h-4 w-4" /> Diagnosis Confidence</Label>
                          <div className="flex items-center gap-2 pt-1">
                            <Progress value={result.diseaseDiagnosis.confidenceScore * 100} className="w-2/3" />
                            <span className="font-semibold text-sm">{(result.diseaseDiagnosis.confidenceScore * 100).toFixed(0)}%</span>
                          </div>
                      </div>
                       <div>
                          <Label className="flex items-center gap-2 text-muted-foreground"><BadgePercent className="h-4 w-4" /> Plant Confidence</Label>
                          <div className="flex items-center gap-2 pt-1">
                            <Progress value={result.plantIdentification.confidence * 100} className="w-2/3" />
                            <span className="font-semibold text-sm">{(result.plantIdentification.confidence * 100).toFixed(0)}%</span>
                          </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="flex items-center gap-2 text-muted-foreground"><TestTube2 className="h-4 w-4" /> Severity</Label>
                            <p className="font-semibold">{result.diseaseDiagnosis.severity}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="flex items-center gap-2 text-muted-foreground"><ListOrdered className="h-4 w-4" /> Affected Parts</Label>
                            <p className="font-semibold">{result.diseaseDiagnosis.affectedParts?.join(', ') || 'N/A'}</p>
                        </div>
                    </div>
                    <div>
                        <Label className="text-lg font-semibold flex items-center gap-2"><ListOrdered className="h-5 w-5 text-primary" /> Suggested Remedy</Label>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap prose prose-sm max-w-none">{result.diseaseDiagnosis.suggestedRemedy}</p>
                    </div>
                     <div>
                        <Label className="text-lg font-semibold flex items-center gap-2"><Leaf className="h-5 w-5 text-primary" /> Alternative Home Remedies</Label>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap prose prose-sm max-w-none">{result.diseaseDiagnosis.alternativeRemedies}</p>
                    </div>
                     <div>
                        <Label className="text-lg font-semibold flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Preventive Measures</Label>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap prose prose-sm max-w-none">{result.diseaseDiagnosis.preventiveMeasures}</p>
                    </div>
                </CardContent>
            </Card>
            ) : (
                <Card className="lg:col-span-3 flex items-center justify-center h-full">
                    <div className="text-center p-8">
                        <Wand2 className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">Awaiting Diagnosis</h3>
                        <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
                            Provide your crop images and location, then click "Diagnose" to see the AI analysis here.
                        </p>
                    </div>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}

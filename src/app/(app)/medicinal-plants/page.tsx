
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
import { Wand2, RefreshCw, ImagePlus, X, Camera, HeartPulse, Microscope, AlertTriangle, Pill, BookText, Languages } from "lucide-react";
import Image from "next/image";
import {
  identifyMedicinalPlant,
  type IdentifyMedicinalPlantOutput,
} from "@/ai/flows/medicinal-plant-identifier";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

export default function MedicinalPlantPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyMedicinalPlantOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Clean up preview URL and camera stream
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleImageFile = (file: File) => {
    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    setIsCameraOpen(false);
  }

  const removeImage = () => {
    setImageFile(null);
    if(previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const startCamera = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsCameraOpen(true);
            removeImage();
        }
    } catch (err) {
        console.error("Camera error:", err);
        toast({ variant: "destructive", title: "Camera Error", description: "Could not access camera. Please check permissions."});
    }
  }

  const takePicture = () => {
      if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const context = canvas.getContext('2d');
          context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          canvas.toBlob(blob => {
              if (blob) {
                  handleImageFile(new File([blob], "capture.jpg", { type: "image/jpeg" }));
              }
          }, 'image/jpeg');
      }
  }

  const handleIdentify = async () => {
    if (!imageFile) {
      setError("Please provide an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const imageUri = await fileToDataUri(imageFile);
      const identificationResult = await identifyMedicinalPlant({ imageUri });

      if (!identificationResult.isMedicinal) {
        setError(`The AI identified this as "${identificationResult.commonName}", which is not a known medicinal plant. Please try again with a different image.`);
        setResult(identificationResult); // still show the identification
      } else {
        setResult(identificationResult);
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to get identification. ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Identification Failed",
        description: "There was a problem contacting the AI service.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    removeImage();
    setResult(null);
    setError(null);
    setIsCameraOpen(false);
    if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <HeartPulse className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Medicinal Plant Identifier</h1>
          <p className="text-muted-foreground">
            Use your camera or upload an image to identify medicinal plants.
          </p>
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
            <CardHeader>
            <CardTitle>1. Provide Plant Image</CardTitle>
            <CardDescription>
                Use your camera or upload a clear photo of the plant.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isCameraOpen ? (
                    <div className="space-y-2">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-lg border aspect-video object-cover"></video>
                        <Button onClick={takePicture} className="w-full">
                            <Camera className="mr-2 h-4 w-4"/> Capture Image
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label
                            htmlFor="picture"
                            className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"
                        >
                        {previewUrl ? (
                           <>
                             <Image src={previewUrl} alt="Plant Preview" fill className="rounded-md object-cover"/>
                             <Button
                                size="icon"
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full z-10"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImage(); }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                           </>
                        ) : (
                            <div className="text-center">
                                <ImagePlus className="h-10 w-10 text-muted-foreground mx-auto" />
                                <p className="mt-2 text-sm text-muted-foreground">Click to upload image</p>
                            </div>
                        )}
                      </Label>
                      <Input id="picture" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} ref={fileInputRef} disabled={isLoading} />
                      <Button variant="outline" onClick={startCamera} className="w-full" disabled={isLoading}>
                          <Camera className="mr-2 h-4 w-4"/> Open Camera
                      </Button>
                  </div>
                )}
            
            {error && !result?.isMedicinal && (
                <Alert variant="destructive">
                  <AlertTitle>Not a Medicinal Plant</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            </CardContent>
            <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleReset} disabled={isLoading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
            </Button>
            <Button onClick={handleIdentify} disabled={!imageFile || isLoading}>
                {isLoading ? (
                <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Identifying...
                </>
                ) : (
                <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Identify
                </>
                )}
            </Button>
            </CardFooter>
        </Card>

        <canvas ref={canvasRef} className="hidden"></canvas>

        <div className="lg:col-span-3">
            {result ? (
            <Card className="animate-in fade-in-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <HeartPulse />
                      </div>
                      <span>{result.commonName}</span>
                    </CardTitle>
                    <CardDescription>
                        <strong>Botanical Name:</strong> {result.botanicalName}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="space-y-1">
                        <Label className="flex items-center gap-2 font-semibold text-base"><Microscope className="h-5 w-5 text-primary" /> Medicinal Uses</Label>
                        <p className="text-sm text-muted-foreground pl-7">{result.medicinalUses}</p>
                    </div>
                     <div className="space-y-1">
                        <Label className="flex items-center gap-2 font-semibold text-base"><Pill className="h-5 w-5 text-primary" /> Parts Used</Label>
                        <p className="text-sm text-muted-foreground pl-7">{result.partsUsed}</p>
                    </div>
                     <div className="space-y-1">
                        <Label className="flex items-center gap-2 font-semibold text-base"><BookText className="h-5 w-5 text-primary" /> Preparation Methods</Label>
                        <p className="text-sm text-muted-foreground pl-7">{result.preparationMethods}</p>
                    </div>
                    <div className="space-y-1">
                        <Label className="flex items-center gap-2 font-semibold text-base"><Languages className="h-5 w-5 text-primary" /> Regional Names</Label>
                        <p className="text-sm text-muted-foreground pl-7">{result.regionalNames}</p>
                    </div>
                    <Alert variant={result.precautions?.toLowerCase().trim() === 'none' ? 'default' : 'destructive'}>
                        <AlertTriangle className="h-4 w-4"/>
                        <AlertTitle>Precautions & Warnings</AlertTitle>
                        <AlertDescription>{result.precautions}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
            ) : (
                <Card className="lg:col-span-3 flex items-center justify-center h-full">
                    <div className="text-center p-8">
                        <Wand2 className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">Awaiting Identification</h3>
                        <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
                           Provide a plant image and click "Identify" to see the AI analysis here.
                        </p>
                    </div>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}

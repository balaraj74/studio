"use client";

import * as React from "react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";
import { auth } from "@/lib/firebase/config";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, Camera, ImageIcon, File, Loader2 } from "lucide-react";

interface FileUploadManagerProps {
  onUploadComplete?: (url: string) => void;
}

interface UploadTask {
  id: number;
  file: File;
  progress: number;
  error?: string;
  url?: string;
}

export function FileUploadManager({
  onUploadComplete,
}: FileUploadManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);
  const [uploads, setUploads] = React.useState<UploadTask[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0 || !user) {
      return;
    }

    const newUploads: UploadTask[] = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      file,
      progress: 0,
    }));
    
    setUploads((prev) => [...prev, ...newUploads]);
    setIsOpen(false);

    newUploads.forEach((task) => uploadFile(task));
  };

  const uploadFile = (task: UploadTask) => {
    if (!user) {
        updateTask(task.id, { error: "You must be logged in to upload files." });
        return;
    }

    const storage = getStorage();
    const db = getFirestore();
    const userId = user.uid;

    const storageRef = ref(
      storage,
      `uploads/${userId}/${Date.now()}-${task.file.name}`
    );
    const uploadTask = uploadBytesResumable(storageRef, task.file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        updateTask(task.id, { progress: percent });
      },
      (error) => {
        console.error("Upload error:", error);
        updateTask(task.id, { error: "Upload failed. Please try again." });
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          const docRef = await addDoc(
            collection(db, `users/${userId}/uploads`),
            {
              name: task.file.name,
              type: task.file.type,
              size: task.file.size,
              url: downloadURL,
              uploadedAt: serverTimestamp(),
            }
          );
          
          updateTask(task.id, { progress: 100, url: downloadURL });
          toast({ title: "Upload Complete", description: `${task.file.name} has been uploaded.`});
          onUploadComplete?.(downloadURL);

        } catch (error) {
            console.error("Firestore error:", error);
            updateTask(task.id, { error: "Failed to save file details." });
        }
      }
    );
  };
  
  const updateTask = (id: number, updates: Partial<UploadTask>) => {
      setUploads(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }

  return (
    <div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button>
            <Upload className="mr-2 h-4 w-4" /> Upload File
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Choose an upload option</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <Button
              variant="outline"
              className="w-full justify-start h-14 text-base"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="mr-4 h-6 w-6" /> Capture with Camera
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-14 text-base"
              onClick={() => photoInputRef.current?.click()}
            >
              <ImageIcon className="mr-4 h-6 w-6" /> Choose from Photos
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-14 text-base"
              onClick={() => fileInputRef.current?.click()}
            >
              <File className="mr-4 h-6 w-6" /> Choose from Files
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Hidden file inputs */}
      <input type="file" accept="video/*,image/*" capture="environment" ref={cameraInputRef} className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />
      <input type="file" accept="image/*" ref={photoInputRef} className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />
      <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />
      
      {uploads.length > 0 && (
          <div className="mt-4 space-y-4">
              <h3 className="font-semibold">Uploads</h3>
              {uploads.map(task => (
                  <Card key={task.id}>
                    <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                             <div className="flex-shrink-0 bg-muted p-2 rounded-md">
                                {task.file.type.startsWith('image/') ? <ImageIcon className="h-6 w-6" /> : <File className="h-6 w-6" />}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium truncate">{task.file.name}</p>
                                <p className="text-xs text-muted-foreground">{ (task.file.size / 1024 / 1024).toFixed(2) } MB</p>
                                <Progress value={task.progress} className="mt-1 h-2" />
                            </div>
                        </div>
                        {task.error && (
                            <Alert variant="destructive" className="mt-2">
                                <AlertDescription>{task.error}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                  </Card>
              ))}
          </div>
      )}
    </div>
  );
}

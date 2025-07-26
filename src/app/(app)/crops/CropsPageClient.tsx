
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, CalendarIcon, CheckCircle2, Circle, Clock } from "lucide-react";
import type { Crop, CropStatus, CropTask } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getCrops, addCrop, updateCrop, deleteCrop, type CropFormInput } from "@/lib/actions/crops";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from 'firebase/auth';


const statusStyles: { [key in CropStatus]: string } = {
  Planned: "bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30 border-yellow-500/30",
  Growing: "bg-green-500/20 text-green-700 hover:bg-green-500/30 border-green-500/30",
  Harvested: "bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 border-blue-500/30",
};

export default function CropsPageClient() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchCrops = async () => {
    if (user) {
      setIsLoading(true);
      const fetchedCrops = await getCrops(user.uid);
      setCrops(fetchedCrops);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, [user]);

  const handleAddNew = () => {
    setEditingCrop(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (crop: Crop) => {
    setEditingCrop(crop);
    setIsDialogOpen(true);
  };

  const handleDelete = async (cropId: string) => {
    if (!user) return;
    const result = await deleteCrop(user.uid, cropId);
    if (result.success) {
      toast({ title: "Crop deleted successfully." });
      await fetchCrops();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };
  
  const handleTaskToggle = async (crop: Crop, taskIndex: number, isCompleted: boolean) => {
    if (!user) return;

    const updatedCalendar = [...crop.calendar];
    updatedCalendar[taskIndex] = { ...updatedCalendar[taskIndex], isCompleted };

    const result = await updateCrop(user.uid, crop.id, { calendar: updatedCalendar });
    if (result.success) {
      // Optimistically update UI, then refresh from source
      setCrops(prevCrops => prevCrops.map(c => c.id === crop.id ? { ...c, calendar: updatedCalendar } : c));
      await fetchCrops();
    } else {
      toast({ variant: "destructive", title: "Update failed", description: "Could not save task status." });
    }
  };

  const renderContent = () => {
     if (isLoading) {
      return (
        <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      );
    }
    
    if (crops.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No crops found. Add your first crop to get started.</p>
        </div>
      );
    }
    
    return (
        <Accordion type="single" collapsible className="w-full space-y-2">
            {crops.map((crop) => (
                <AccordionItem value={crop.id} key={crop.id} className="border rounded-xl bg-card">
                   <AccordionTrigger className="p-4 hover:no-underline">
                     <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 text-left">
                                <p className="font-bold text-base">{crop.name}</p>
                                <p className="text-sm text-muted-foreground">{crop.region || "No region"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Badge className={cn("border", statusStyles[crop.status])}>{crop.status}</Badge>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(crop); }}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(crop.id); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                     </div>
                   </AccordionTrigger>
                   <AccordionContent className="px-4 pb-4">
                        <div className="border-t pt-4">
                            <h4 className="font-semibold mb-2">Crop Calendar</h4>
                            {crop.calendar && crop.calendar.length > 0 ? (
                                <ul className="space-y-3">
                                    {crop.calendar.sort((a,b) => a.startDate.getTime() - b.startDate.getTime()).map((task, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <Checkbox 
                                                id={`task-${crop.id}-${index}`}
                                                checked={task.isCompleted} 
                                                onCheckedChange={(checked) => handleTaskToggle(crop, index, !!checked)}
                                            />
                                            <div className="flex-1">
                                                <Label htmlFor={`task-${crop.id}-${index}`} className={cn("font-medium", task.isCompleted && "line-through text-muted-foreground")}>
                                                    {task.taskName}
                                                </Label>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                    <Clock className="h-3 w-3" />
                                                    {format(task.startDate, "MMM d")} - {format(task.endDate, "MMM d")}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No calendar generated for this crop. Edit the crop and add a region to generate one.</p>
                            )}
                        </div>
                   </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="hidden md:block">
          <h1 className="text-3xl font-bold">Crop Management</h1>
          <p className="text-muted-foreground">
            Manage your crops and track their growth cycle and tasks.
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Add New Crop
        </Button>
      </div>
      
      {renderContent()}

      <CropFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        crop={editingCrop}
        user={user}
        onFormSubmit={fetchCrops}
      />
    </div>
  );
}

interface CropFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  crop: Crop | null;
  user: User | null;
  onFormSubmit: () => Promise<void>;
}

function CropFormDialog({
  isOpen,
  onOpenChange,
  crop,
  user,
  onFormSubmit,
}: CropFormDialogProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<CropStatus>("Planned");
  const [region, setRegion] = useState("");
  const [plantedDate, setPlantedDate] = useState<Date | undefined>();
  const [harvestDate, setHarvestDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isOpen) {
      setName(crop?.name || "");
      setStatus(crop?.status || "Planned");
      setRegion(crop?.region || "");
      setPlantedDate(crop?.plantedDate ? new Date(crop.plantedDate) : undefined);
      setHarvestDate(crop?.harvestDate ? new Date(crop.harvestDate) : undefined);
      setNotes(crop?.notes || "");
    }
  }, [isOpen, crop]);

  const handleSubmit = async () => {
    if (!name) {
        toast({ variant: "destructive", title: "Error", description: "Crop name is required." });
        return;
    }
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to add a crop. Please refresh the page."});
        return;
    }
    
    setIsSubmitting(true);

    const cropData: CropFormInput = {
        name,
        status,
        notes,
        region,
        plantedDate: plantedDate ? plantedDate.toISOString() : null,
        harvestDate: harvestDate ? harvestDate.toISOString() : null,
    };

    const result = crop?.id 
      ? await updateCrop(user.uid, crop.id, { ...cropData, calendar: crop.calendar }) 
      : await addCrop(user.uid, cropData);

    if (result.success) {
        toast({ title: `Crop ${crop ? "updated" : "added"} successfully.` });
        await onFormSubmit();
        onOpenChange(false);
    } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
    }

    setIsSubmitting(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{crop ? "Edit Crop" : "Add New Crop"}</DialogTitle>
          <DialogDescription>
            {crop
              ? "Update the details for your crop."
              : "Fill in the details for your new crop to generate its calendar."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Crop Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g. Paddy"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="region" className="text-right">
              Region
            </Label>
            <Input
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="col-span-3"
              placeholder="e.g. Karnataka"
              disabled={isSubmitting || !!crop?.id} // Disable for edit
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select onValueChange={(v) => setStatus(v as CropStatus)} value={status} disabled={isSubmitting}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planned">Planned</SelectItem>
                <SelectItem value="Growing">Growing</SelectItem>
                <SelectItem value="Harvested">Harvested</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="planted-date" className="text-right">
              Planted Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !plantedDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {plantedDate ? format(plantedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={plantedDate}
                  onSelect={setPlantedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="harvest-date" className="text-right">
              Harvest Date
            </Label>
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !harvestDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {harvestDate ? format(harvestDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={harvestDate}
                  onSelect={setHarvestDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
              placeholder="Any additional notes..."
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

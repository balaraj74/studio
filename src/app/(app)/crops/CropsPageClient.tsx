
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Leaf, Plus, Pencil, Trash2, CalendarIcon } from "lucide-react";
import type { Crop, CropStatus } from "@/types";
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

  useEffect(() => {
    async function fetchCrops() {
      if (user) {
        setIsLoading(true);
        const fetchedCrops = await getCrops(user.uid);
        setCrops(fetchedCrops);
        setIsLoading(false);
      }
    }
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
      const fetchedCrops = await getCrops(user.uid);
      setCrops(fetchedCrops);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };

  const onFormSubmit = async () => {
    if(user) {
      const fetchedCrops = await getCrops(user.uid);
      setCrops(fetchedCrops);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Leaf className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-headline">Crop Management</h1>
            <p className="text-muted-foreground">
              Manage your crops and track their growth cycle.
            </p>
          </div>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Add New Crop
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Crops</CardTitle>
          <CardDescription>
            A list of all crops you are currently tracking on your farm.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crop Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Planted Date</TableHead>
                  <TableHead>Harvest Date</TableHead>
                  <TableHead className="hidden md:table-cell">Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[90px] rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-[90px]" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-[90px]" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-[120px]" /></TableCell>
                        <TableCell className="text-right space-x-1"><Skeleton className="h-8 w-8 inline-block" /><Skeleton className="h-8 w-8 inline-block" /></TableCell>
                    </TableRow>
                  ))
                ) : crops.length > 0 ? (
                  crops.map((crop) => (
                    <TableRow key={crop.id}>
                      <TableCell className="font-medium">{crop.name}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn("border", statusStyles[crop.status])}
                        >
                          {crop.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {crop.plantedDate
                          ? format(crop.plantedDate, "dd MMM, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {crop.harvestDate
                          ? format(crop.harvestDate, "dd MMM, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate">
                        {crop.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(crop)}
                          aria-label="Edit crop"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(crop.id)}
                          className="text-destructive hover:text-destructive"
                          aria-label="Delete crop"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      No crops found. Add your first crop to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CropFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        crop={editingCrop}
        user={user}
        onFormSubmit={onFormSubmit}
      />
    </div>
  );
}

interface CropFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  crop: Crop | null;
  user: User | null;
  onFormSubmit: () => void;
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
  const [plantedDate, setPlantedDate] = useState<Date | undefined>();
  const [harvestDate, setHarvestDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isOpen) {
      setName(crop?.name || "");
      setStatus(crop?.status || "Planned");
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
        plantedDate: plantedDate ? plantedDate.toISOString() : null,
        harvestDate: harvestDate ? harvestDate.toISOString() : null,
    };

    const result = crop?.id ? await updateCrop(user.uid, crop.id, cropData) : await addCrop(user.uid, cropData);

    if (result.success) {
        toast({ title: `Crop ${crop ? "updated" : "added"} successfully.` });
        onOpenChange(false);
        onFormSubmit();
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
              : "Fill in the details for your new crop."}
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
              disabled={isSubmitting}
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

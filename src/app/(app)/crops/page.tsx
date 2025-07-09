
"use client";

import { useState, useEffect } from "react";
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

const initialCrops: Crop[] = [
  {
    id: "1",
    name: "Pomegranate",
    status: "Planned",
    plantedDate: null,
    harvestDate: null,
    notes: "",
  },
  {
    id: "2",
    name: "Wheat",
    status: "Growing",
    plantedDate: new Date("2025-06-12"),
    harvestDate: new Date("2025-09-12"),
    notes: "Second batch of the season.",
  },
  {
    id: "3",
    name: "Cotton",
    status: "Harvested",
    plantedDate: new Date("2024-03-01"),
    harvestDate: new Date("2024-08-15"),
    notes: "Good yield this year.",
  },
];

const statusStyles: { [key in CropStatus]: string } = {
  Planned: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200",
  Growing: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
  Harvested: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
};

export default function CropsPage() {
  const [crops, setCrops] = useState<Crop[]>(initialCrops);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);

  const handleAddNew = () => {
    setEditingCrop(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (crop: Crop) => {
    setEditingCrop(crop);
    setIsDialogOpen(true);
  };

  const handleDelete = (cropId: string) => {
    setCrops(crops.filter((crop) => crop.id !== cropId));
  };

  const handleSaveCrop = (cropData: Omit<Crop, "id">) => {
    if (editingCrop) {
      // Update existing crop
      setCrops(
        crops.map((c) =>
          c.id === editingCrop.id ? { ...c, ...cropData } : c
        )
      );
    } else {
      // Add new crop
      const newCrop: Crop = {
        id: (crops.length + 1).toString(),
        ...cropData,
      };
      setCrops([...crops, newCrop]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Leaf className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold font-headline">Crop Management</h1>
            <p className="text-muted-foreground">
              Manage your crops and track their growth
            </p>
          </div>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Add Crop
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Crops</CardTitle>
          <CardDescription>
            {crops.length} crops in your farm
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
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crops.length > 0 ? (
                  crops.map((crop) => (
                    <TableRow key={crop.id}>
                      <TableCell className="font-medium">{crop.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(statusStyles[crop.status])}
                        >
                          {crop.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {crop.plantedDate
                          ? format(crop.plantedDate, "dd/MM/yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {crop.harvestDate
                          ? format(crop.harvestDate, "dd/MM/yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {crop.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(crop)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(crop.id)}
                          className="text-destructive hover:text-destructive"
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
        onSave={handleSaveCrop}
        crop={editingCrop}
      />
    </div>
  );
}

interface CropFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<Crop, "id">) => void;
  crop: Crop | null;
}

function CropFormDialog({
  isOpen,
  onOpenChange,
  onSave,
  crop,
}: CropFormDialogProps) {
  const [name, setName] = useState(crop?.name || "");
  const [status, setStatus] = useState<CropStatus>(crop?.status || "Planned");
  const [plantedDate, setPlantedDate] = useState<Date | undefined>(
    crop?.plantedDate || undefined
  );
  const [harvestDate, setHarvestDate] = useState<Date | undefined>(
    crop?.harvestDate || undefined
  );
  const [notes, setNotes] = useState(crop?.notes || "");

  const handleSubmit = () => {
    onSave({ name, status, plantedDate, harvestDate, notes });
  };
  
  useEffect(() => {
    if (isOpen) {
      setName(crop?.name || "");
      setStatus(crop?.status || "Planned");
      setPlantedDate(crop?.plantedDate || undefined);
      setHarvestDate(crop?.harvestDate || undefined);
      setNotes(crop?.notes || "");
    }
  }, [isOpen, crop]);

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
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select onValueChange={(v) => setStatus(v as CropStatus)} value={status}>
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
                    "w-[280px] justify-start text-left font-normal",
                    !plantedDate && "text-muted-foreground"
                  )}
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
                    "w-[280px] justify-start text-left font-normal",
                    !harvestDate && "text-muted-foreground"
                  )}
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Save Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


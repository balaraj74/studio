
"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Plus, Pencil, Trash2, CalendarIcon, Scale } from "lucide-react";
import type { Harvest, HarvestUnit } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";


export default function HarvestPageClient({ initialHarvests }: { initialHarvests: Harvest[] }) {
  const [harvests, setHarvests] = useState<Harvest[]>(initialHarvests);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState<Harvest | null>(null);

  const summary = useMemo(() => {
    const totalHarvests = harvests.length;
    const activeCrops = new Set(harvests.map(h => h.cropName)).size;
    const latestHarvest = harvests.length > 0
      ? harvests.sort((a, b) => b.harvestDate.getTime() - a.harvestDate.getTime())[0]
      : null;

    return { totalHarvests, activeCrops, latestHarvest };
  }, [harvests]);


  const handleAddNew = () => {
    setEditingHarvest(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (harvest: Harvest) => {
    setEditingHarvest(harvest);
    setIsDialogOpen(true);
  };

  const handleDelete = (harvestId: string) => {
    setHarvests(harvests.filter((h) => h.id !== harvestId));
  };

  const handleSaveHarvest = (harvestData: Omit<Harvest, "id">) => {
    if (editingHarvest) {
      setHarvests(
        harvests.map((h) =>
          h.id === editingHarvest.id ? { ...h, ...harvestData } : h
        )
      );
    } else {
      const newHarvest: Harvest = {
        id: (harvests.length + 1).toString(),
        ...harvestData,
      };
      setHarvests([...harvests, newHarvest]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold font-headline">Output Tracking</h1>
            <p className="text-muted-foreground">
              Record and track your crop yields
            </p>
          </div>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Record Output
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader>
                <CardTitle>Total Harvests</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">{summary.totalHarvests}</p>
                <p className="text-sm text-muted-foreground">Harvest records</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Active Crops</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">{summary.activeCrops}</p>
                <p className="text-sm text-muted-foreground">Crops with output</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Latest Harvest</CardTitle>
            </CardHeader>
            <CardContent>
                {summary.latestHarvest ? (
                    <>
                        <p className="text-xl font-bold">{summary.latestHarvest.cropName}</p>
                        <p className="text-sm text-muted-foreground">{format(summary.latestHarvest.harvestDate, "PPP")}</p>
                    </>
                ) : (
                    <>
                        <p className="text-xl font-semibold">No harvests</p>
                        <p className="text-sm text-muted-foreground">Record your first harvest</p>
                    </>
                )}
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Harvest Records</CardTitle>
          <CardDescription>
            {harvests.length} harvest records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crop</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {harvests.length > 0 ? (
                  harvests.map((harvest) => (
                    <TableRow key={harvest.id}>
                      <TableCell className="font-medium">{harvest.cropName}</TableCell>
                      <TableCell>
                        {harvest.quantity} {harvest.unit}
                      </TableCell>
                      <TableCell>
                        {format(harvest.harvestDate, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{harvest.notes || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(harvest)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(harvest.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-48">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Scale className="h-12 w-12 text-muted-foreground" />
                        <h3 className="font-semibold">No harvest records yet</h3>
                        <p className="text-muted-foreground text-sm">Click "Record Output" to start tracking.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <HarvestFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveHarvest}
        harvest={editingHarvest}
      />
    </div>
  );
}

interface HarvestFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<Harvest, "id">) => void;
  harvest: Harvest | null;
}

function HarvestFormDialog({
  isOpen,
  onOpenChange,
  onSave,
  harvest,
}: HarvestFormDialogProps) {
  const [cropName, setCropName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<HarvestUnit>("kg");
  const [harvestDate, setHarvestDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState("");
  
  // In a real app, you'd fetch this from your crops list
  const availableCrops = ["Pomegranate", "Wheat", "Cotton"];

  const handleSubmit = () => {
    if(!cropName || !quantity || !harvestDate) return;
    onSave({ cropName, cropId: cropName, quantity: parseFloat(quantity), unit, harvestDate, notes });
  };
  
  useEffect(() => {
    if (isOpen) {
      setCropName(harvest?.cropName || "");
      setQuantity(harvest?.quantity.toString() || "");
      setUnit(harvest?.unit || "kg");
      setHarvestDate(harvest?.harvestDate || new Date());
      setNotes(harvest?.notes || "");
    }
  }, [isOpen, harvest]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{harvest ? "Edit Harvest Record" : "Record New Output"}</DialogTitle>
          <DialogDescription>
            {harvest
              ? "Update the details for your harvest."
              : "Fill in the details for your new harvest."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cropName" className="text-right">
              Crop
            </Label>
             <Select onValueChange={setCropName} value={cropName}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a crop" />
              </SelectTrigger>
              <SelectContent>
                {availableCrops.map(crop => <SelectItem key={crop} value={crop}>{crop}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="col-span-2"
              placeholder="e.g. 100"
            />
             <Select onValueChange={(v) => setUnit(v as HarvestUnit)} value={unit}>
              <SelectTrigger className="col-span-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="quintal">quintal</SelectItem>
                <SelectItem value="tonne">tonne</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
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
            Save Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

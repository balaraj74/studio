

export interface MarketPrice {
  crop: string;
  region: string;
  price: number;
  change: number;
}

export interface Scheme {
  name: string;
  crop: string;
  state: string;
  description: string;
  link: string;
}

export type CropStatus = "Planned" | "Growing" | "Harvested";

export interface Crop {
  id: string;
  name: string;
  status: CropStatus;
  plantedDate: Date | null;
  harvestDate: Date | null;
  notes: string | null;
}

export type ExpenseCategory = "Seeds" | "Fertilizer" | "Labor" | "Equipment" | "Other";

export interface Expense {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: Date;
  notes?: string;
}

export type HarvestUnit = "kg" | "quintal" | "tonne";

export interface Harvest {
  id: string;
  cropId: string;
  cropName: string;
  quantity: number;
  unit: HarvestUnit;
  harvestDate: Date;
  notes?: string;
}

// Type for storing field boundary data
export interface Field {
    id: string;
    fieldName: string;
    surveyNumber: string;
    village: string;
    area: number; // in acres
    coordinates: google.maps.LatLngLiteral[];
    centroid: google.maps.LatLngLiteral;
    cropId?: string | null;
    cropName?: string | null;
}

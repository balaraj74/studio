import type { MarketPrice, Scheme, Expense, Harvest } from "@/types";

export const marketPrices: MarketPrice[] = [
  { crop: "Rice (Paddy)", region: "Punjab", price: 1940, change: 1.5 },
  { crop: "Wheat", region: "Uttar Pradesh", price: 2015, change: -0.8 },
  { crop: "Maize", region: "Karnataka", price: 1870, change: 2.1 },
  { crop: "Cotton", region: "Gujarat", price: 6025, change: 0.5 },
  { crop: "Sugarcane", region: "Maharashtra", price: 3050, change: -0.2 },
  { crop: "Soybean", region: "Madhya Pradesh", price: 4200, change: 3.0 },
];

export const states = ["All", "Karnataka", "Maharashtra", "Punjab", "Uttar Pradesh", "Gujarat", "Madhya Pradesh", "Central"];
export const crops = ["All", "Rice", "Wheat", "Maize", "Cotton", "Sugarcane", "Soybean"];

export const schemes: Scheme[] = [
  {
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    crop: "All",
    state: "Central",
    description: "An insurance service for farmers for their yields. It provides financial support to farmers suffering crop loss/damage arising out of unforeseen events.",
    link: "https://pmfby.gov.in/",
  },
  {
    name: "Kisan Credit Card (KCC) Scheme",
    crop: "All",
    state: "Central",
    description: "Provides farmers with timely access to credit for their cultivation and other needs. Aims to meet the short-term credit requirements for cultivation of crops.",
    link: "#",
  },
  {
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    crop: "All",
    state: "Central",
    description: "A central sector scheme with 100% funding from the Government of India. It provides an income support of ₹6,000 per year in three equal installments to all landholding farmer families.",
    link: "https://pmkisan.gov.in/",
  },
  {
    name: "Raita Vidya Nidhi",
    crop: "All",
    state: "Karnataka",
    description: "Scholarship scheme for children of farmers in Karnataka to pursue higher education.",
    link: "#",
  },
  {
    name: "National Food Security Mission (NFSM)",
    crop: "Rice",
    state: "Central",
    description: "Aims to increase the production of rice, wheat, pulses, coarse cereals and commercial crops through area expansion and productivity enhancement.",
    link: "https://www.nfsm.gov.in/",
  },
  {
    name: "National Mission on Oilseeds and Oil Palm (NMOOP)",
    crop: "Soybean",
    state: "Madhya Pradesh",
    description: "Aims to increase the production of oilseeds and oil palm to meet the domestic demand for edible oils.",
    link: "#",
  }
];

export const initialExpenses: Expense[] = [
    { id: "1", name: "Urea Fertilizer", category: "Fertilizer", amount: 1500, date: new Date("2025-06-15") },
    { id: "2", name: "Tractor Rental", category: "Equipment", amount: 3000, date: new Date("2025-06-10") },
    { id: "3", name: "Wheat Seeds", category: "Seeds", amount: 2200, date: new Date("2025-06-05") },
    { id: "4", name: "Daily Wages for 5 workers", category: "Labor", amount: 2500, date: new Date("2025-07-01") },
];

export const initialHarvests: Harvest[] = [];

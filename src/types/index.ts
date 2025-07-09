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

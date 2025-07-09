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

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

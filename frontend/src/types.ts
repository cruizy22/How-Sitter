
export enum UserRole {
  LISTER = 'LISTER',
  SITTER = 'SITTER'
}

export enum StayDuration {
  ONE_MONTH = '1 month',
  TWO_FOUR_MONTHS = '2–4 months',
  THREE_SIX_MONTHS = '3–6 months',
  SIX_ELEVEN_MONTHS = '6–11 months',
  ONE_YEAR_PLUS = '1 year or more'
}

export interface Sitter {
  id: string;
  name: string;
  country: string;
  flag: string;
  bio: string;
  rating: number;
  reviews: number;
  verified: boolean;
  credentials: string[];
  imageUrl: string;
}

export interface PropertyListing {
  id: string;
  listerId: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  duration: StayDuration;
  securityDeposit: number;
  rules: string;
  images: string[];
  websiteUrl?: string;
  virtualTourUrl?: string;
}

// Fix: Added index signature to resolve "Index signature for type 'string' is missing" 
// error in components/TravelTracker.tsx (line 66) when passing data to Recharts components.
export interface TravelStat {
  country: string;
  duration: string;
  percentage: number;
  flag: string;
  [key: string]: any;
}
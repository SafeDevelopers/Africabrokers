export type ListingStatus = "Verified" | "Pending";
export type ListingPurpose = "Rent" | "Sale";

export type ListingReview = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  relationship: "Tenant" | "Buyer" | "Corporate" | "Prospect";
};

export type Listing = {
  id: string;
  title: string;
  purpose: ListingPurpose;
  propertyType: string;
  price: number;
  priceLabel: string;
  location: string;
  latitude: number;
  longitude: number;
  status: ListingStatus;
  brokerId: string;
  bedrooms: number | null;
  bathrooms: number;
  area: string;
  image: string;
  imageUrl?: string;
  gallery: string[];
  overallRating: number;
  description: string;
  features: string[];
  amenities: string[];
  reviews: ListingReview[];
};

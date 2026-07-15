export interface Village {
  id: string | number;
  name: string;
  developer: string;
  startingPrice: string;
  availableProperties: number;
  image: string;
  location?: string;
  amenities?: string[];
}

export interface Property {
  id: string | number;
  name: string;
  village: string;
  listingType: string;
  status: string;
  creationDate: string;
  image?: string;
  price?: string;
  developer?: string;
  location?: string;
  propertyType?: string;
  area?: string;
  bedrooms?: number;
  bathrooms?: number;
  finishingStatus?:string;
  deliveryDate?:string;
  amenities?: string[];
}

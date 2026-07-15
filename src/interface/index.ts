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
  id: string  |number ;
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
  bedrooms?: number | string;
  bathrooms?: number | string;

    stats?: {
    icon: string;
    value: string;
  }[];
  finishingStatus?: string;
  deliveryDate?: string;
  amenities?: string[];
  // Details page fields
  description?: string;
  orientation?: string;
  lastUpdated?: string;
  gallery?: string[];
  totalPrice?: string;
  downPayment?: string;
  monthlyInstallment?: string;
  installmentPeriod?: string;
  rentalYield?: string;
}


export interface ActionDef<T> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  className?: string;
  disabled?: boolean;
}

export interface ActionDropdownProps<T> {
  row: T;
  actions: ActionDef<T>[];
}



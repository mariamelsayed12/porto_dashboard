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
  preferUp?: boolean;
}



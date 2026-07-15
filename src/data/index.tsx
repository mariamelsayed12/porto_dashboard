import type { FieldConfig } from "../components/Ui/FormDrawer";
import type { Village } from "../interface/village";
import type { Property } from "../interface/property";
import portoGolfImg from "../assets/default.png";


export const villageFormFields: FieldConfig[] = [
  {
    name: "name",
    label: "Village name",
    type: "text",
    placeholder: "Input text",
    required: true,
  },
  {
    name: "developer",
    label: "Developer name",
    type: "text",
    placeholder: "Input text",
    required: true,
  },
  {
    type: "divider",
    name: "div-1",
  },
  {
    name: "price",
    label: "Starting price",
    type: "text",
    placeholder: "Input text",
    required: true,
  },
  {
    name: "rentalYield",
    label: "Rental yield",
    type: "text",
    placeholder: "Input text",
    required: true,
  },
  {
    type: "divider",
    name: "div-2",
  },
  {
    name: "amenities",
    label: "Amenities",
    type: "multiselect",
    placeholder: "Select amenities",
    required: true,
    options: [
      { label: "Pool", value: "pool" },
      { label: "Gym", value: "gym" },
      { label: "Beach", value: "beach" },
      { label: "Security", value: "security" },
      { label: "Parking", value: "parking" },
      { label: "Restaurant", value: "restaurant" },
      { label: "Kids Area", value: "kids" },
    ],
  },
  {
    type: "divider",
    name: "div-3",
  },
  {
    name: "media",
    label: "Media",
    type: "image-upload",
    required: true,
  },
  {
    type: "divider",
    name: "div-4",
  },
  {
    name: "location",
    label: "Location",
    type: "location",
    required: true,
  },
];

export const mockVillages: Village[] = [
  {
    id: 1,
    name: "Porto Golf",
    developer: "Amer group",
    startingPrice: "2M",
    availableProperties: 24,
    image: portoGolfImg,
  },
  {
    id: 2,
    name: "Porto Marina",
    developer: "Amer group",
    startingPrice: "3.5M",
    availableProperties: 18,
    image: portoGolfImg,
  },
  {
    id: 3,
    name: "Porto Heliopolis",
    developer: "Amer group",
    startingPrice: "1.8M",
    availableProperties: 31,
    image: portoGolfImg,
  },
  {
    id: 4,
    name: "Porto New Cairo",
    developer: "Amer group",
    startingPrice: "2.7M",
    availableProperties: 12,
    image: portoGolfImg,
  },
  {
    id: 5,
    name: "Porto October",
    developer: "Amer group",
    startingPrice: "1.5M",
    availableProperties: 40,
    image: portoGolfImg,
  },
  {
    id: 6,
    name: "Porto South",
    developer: "Amer group",
    startingPrice: "2.2M",
    availableProperties: 9,
    image: portoGolfImg,
  },
];

export const mockProperties: Property[] = [
  {
    id: 1,
    creationDate: "04/11/2026",
    name: "Chalet in golden bay",
    village: "Porto Golf",
    listingType: "Developer",
    status: "Available",
    price: "1.2M",
    developer: "Amer group",
    image: portoGolfImg,
  },
  {
    id: 2,
    creationDate: "05/11/2026",
    name: "Apartment in Porto Marina",
    village: "Porto Marina",
    listingType: "Resale",
    status: "Available",
    price: "2.8M",
    developer: "Amer group",
    image: portoGolfImg,
  },
  {
    id: 3,
    creationDate: "06/11/2026",
    name: "Villa in Porto South",
    village: "Porto South",
    listingType: "Developer",
    status: "Pending",
    price: "4.5M",
    developer: "Amer group",
    image: portoGolfImg,
  },
  {
    id: 4,
    creationDate: "07/11/2026",
    name: "Chalet in Porto October",
    village: "Porto October",
    listingType: "Resale",
    status: "Sold",
    price: "1.6M",
    developer: "Amer group",
    image: portoGolfImg,
  },
  {
    id: 5,
    creationDate: "08/11/2026",
    name: "Penthouse in Porto New Cairo",
    village: "Porto New Cairo",
    listingType: "Developer",
    status: "Available",
    price: "3.2M",
    developer: "Amer group",
    image: portoGolfImg,
  },
];


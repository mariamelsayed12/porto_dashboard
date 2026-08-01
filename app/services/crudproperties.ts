import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface IProperty {
  _id: string;
  name: string;
  description: string;
  listingType: string;
  status: string;
  isFeatured: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  finishingStatus: string;
  orientation: string;
  deliveryDate: string;
  paymentModel: string;
  propertyType:string;
  installmentPrice: number;
  downPaymentPercentage: number;
  downPaymentAmount: number;
  installmentPeriod: string;
  installmentValue: number;
  images: string[];
  coverImage?: string;
  village: {
    _id: string;
    name: string;
    slug: string;
    locationText: string;
    coverImage: string;
  };
  amenities:string[]
}

export interface IpropertyResponse {
  status: string;
  code: number;
  message: string;
  results: number;
  paginationResult: {
    currentPage: number;
    limit: number;
    numberOfPages: number;
    next?: number;
  };
  data: IProperty[];
}

export interface ISinglePropertyResponse {
  status: string;
  code: number;
  message: string;
  data: IProperty;
}

export const propertyApiSlice = createApi({
  reducerPath: "ApiProperty",
  tagTypes: ["properties"],
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
  }),
  endpoints: (builder) => ({
    //----------------------------- Get =>get---------------------
    getProperty: builder.query<IProperty[], { lang: string }>({
      query: () => {
        return {
          url: "properties?limit=1000",
        };
      },
      transformResponse: (response: IpropertyResponse) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "properties" as const,
                id: _id,
              })),
              { type: "properties", id: "LIST" },
            ]
          : [{ type: "properties", id: "LIST" }],
    }),

    //--------------------- Get single property by ID ---------------------
    getPropertyById: builder.query<IProperty, { id: string; lang: string }>({
      query: ({ id}) => ({
        url: `properties/${id}`,
      }),

      transformResponse: (response: ISinglePropertyResponse) => response.data,

      providesTags: (_result, _error, {id}) => [
        { type: "properties", id },
      ],
    }),
  }),
});

export const { useGetPropertyQuery , useGetPropertyByIdQuery } = propertyApiSlice;

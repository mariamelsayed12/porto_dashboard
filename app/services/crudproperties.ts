import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";



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
  cashPrice:number;
  insurance:number;
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
  amenities:string[];
  availableUnits?: number;
  createdAt?: string;
  updatedAt?: string;
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
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    //----------------------------- Get =>get---------------------
    getProperty: builder.query<IpropertyResponse, Record<string, any> | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        let hasLimit = false;
        if (params) {
          Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== "") {
              if (key === "limit") hasLimit = true;
              if (Array.isArray(val)) {
                val.forEach((v) => {
                  queryParams.append(`${key}[]`, v);
                });
              } else {
                queryParams.append(key, val.toString());
              }
            }
          });
        }
        if (!hasLimit) {
          queryParams.append("limit", "1000");
        }
        return {
          url: `properties?${queryParams.toString()}`,
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "properties" as const,
                id: _id,
              })),
              { type: "properties", id: "LIST" },
            ]
          : [{ type: "properties", id: "LIST" }],
    }),

    //--------------------- Get single property by ID ---------------------
    getPropertyById: builder.query<IProperty, { id: string; lang: string }>({
      query: ({ id, lang }) => ({
        url: `properties/${id}`,
        headers: lang ? { "Accept-Language": lang } : undefined,
      }),

      transformResponse: (response: ISinglePropertyResponse) => response.data,

      providesTags: (_result, _error, { id }) => [
        { type: "properties", id },
      ],
    }),

    //--------------------- Create Property ---------------------
    createProperty: builder.mutation<IProperty, FormData>({
      query: (body) => ({
        url: "properties",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "properties", id: "LIST" }],
    }),

    //--------------------- Update Property ---------------------
    updateProperty: builder.mutation<IProperty, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `properties/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "properties", id },
        { type: "properties", id: "LIST" },
      ],
    }),

    //--------------------- Delete Property ---------------------
    deleteProperty: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `properties/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "properties", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPropertyQuery,
  useGetPropertyByIdQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} = propertyApiSlice;

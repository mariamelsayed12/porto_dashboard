import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface IVillage {
  _id: string;
  name: string;
  slug: string;
  developerName: string;
  locationText: string;
  startingPrice: number;
  rentalYield: number;
  coverImage: string;
  galleryImages: string[];
  amenities: string[];
  googleMapsUrl: string;
  latitude: number;
  longitude: number;
}

export interface IVillageResponse {
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
  data: IVillage[];
}

export interface ISingleVillageResponse {
  status: string;
  code: number;
  message: string;
  data: IVillage;
}

export const VillageApiSlice = createApi({
  reducerPath: "ApiVillage",
  tagTypes: ["Village"],
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
  }),
  endpoints: (builder) => ({
    //----------------------------- Get =>get---------------------
    getVillage: builder.query<IVillage[], { lang: string }>({
      query: () => {
        return {
          url: "villages",
        };
      },
      transformResponse: (response: IVillageResponse) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Village" as const,
                id: _id,
              })),
              { type: "Village", id: "LIST" },
            ]
          : [{ type: "Village", id: "LIST" }],
    }),

    //--------------------- Get single village  by ID ---------------------
    getVillageById: builder.query<IVillage, { id: string; lang: string }>({
      query: ({ id }) => ({
        url: `villages/${id}`,
      }),

      transformResponse: (response: ISingleVillageResponse) => response.data,

      providesTags: (_result, _error, { id }) => [
        { type: "Village", id },
      ],
    }),
  }),
});

export const { useGetVillageQuery, useGetVillageByIdQuery } = VillageApiSlice;

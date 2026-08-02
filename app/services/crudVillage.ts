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
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    //----------------------------- Get =>get---------------------
    getVillage: builder.query<IVillage[], { lang?: string } | void>({
      query: (arg) => {
        const lang = arg && typeof arg === "object" ? arg.lang : undefined;
        return {
          url: "villages",
          headers: lang ? { "Accept-Language": lang } : undefined,
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
    getVillageById: builder.query<IVillage, { id: string; lang?: string }>({
      query: ({ id, lang }) => ({
        url: `villages/${id}`,
        headers: lang ? { "Accept-Language": lang } : undefined,
      }),

      transformResponse: (response: ISingleVillageResponse) => response.data,

      providesTags: (_result, _error, { id }) => [
        { type: "Village", id },
      ],
    }),

    //--------------------- Create Village ---------------------
    createVillage: builder.mutation<IVillage, Partial<IVillage>>({
      query: (body) => ({
        url: "villages",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Village", id: "LIST" }],
    }),

    //--------------------- Update Village ---------------------
    updateVillage: builder.mutation<IVillage, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `villages/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Village", id },
        { type: "Village", id: "LIST" },
      ],
    }),

    //--------------------- Delete Village ---------------------
    deleteVillage: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `villages/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Village", id: "LIST" }],
    }),
  }),
});

export const {
  useGetVillageQuery,
  useGetVillageByIdQuery,
  useCreateVillageMutation,
  useUpdateVillageMutation,
  useDeleteVillageMutation,
} = VillageApiSlice;

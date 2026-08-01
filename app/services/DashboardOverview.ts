import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface IDashboardOverview {
  totalVillages: number;
  totalProperties: number;

  propertiesByStatus: {
    [status: string]: number;
  };

  villagesWithPropertyCount: {
    _id: string;
    name: string;
    slug: string;
    coverImage: string;
    propertyCount: number;
  }[];

  latestProperties: {
    _id: string;
    name: string;
    listingType: string;
    status: string;
    installmentPrice: number;
    finishingStatus: string;
    deliveryDate: string;
    village: {
      _id: string;
      name: string;
      slug: string;
    };
    createdAt: string;
  }[];
}

export interface IDashboardOverviewResponse {
  status: string;
  code: number;
  message: string;
  data: IDashboardOverview;
}

export const DashboardOverviewApiSlice = createApi({
  reducerPath: "ApiDashboardOverview",
  tagTypes: ["DashboardOverview"],
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
    getDashboardOverview: builder.query<IDashboardOverview,void>({
      query: () => {
        return {
          url: "admin/dashboard",
        };
      },
      transformResponse: (response: IDashboardOverviewResponse) => response.data,
      providesTags: ["DashboardOverview"],
    }),


  }),
});

export const {useGetDashboardOverviewQuery  } =
  DashboardOverviewApiSlice;

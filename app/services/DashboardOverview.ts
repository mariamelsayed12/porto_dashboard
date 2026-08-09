import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

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
  baseQuery: baseQueryWithReauth,
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

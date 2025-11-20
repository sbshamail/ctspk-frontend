import { createApi } from "@reduxjs/toolkit/query/react";
import { createPublicBaseQuery } from "./baseQuery";

export const brandApi = createApi({
  reducerPath: "brandApi",
  baseQuery: createPublicBaseQuery(""),
  tagTypes: ["Brands"],
  endpoints: (builder) => ({
    getBrands: builder.query<{ data: any[] }, void>({
      query: () => ({
        url: "/manufacturer/list?columnFilters=%5B%5B%27is_active%27%2C%27true%27%5D%5D",
        method: "GET",
      }),
      providesTags: ["Brands"],
    }),
  }),
});

export const { useGetBrandsQuery } = brandApi;

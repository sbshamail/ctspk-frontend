import { createApi } from "@reduxjs/toolkit/query/react";
import { createPublicBaseQuery } from "./baseQuery";

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: createPublicBaseQuery(""),
  tagTypes: ["Categories"],
  endpoints: (builder) => ({
    getCategories: builder.query<{ data: any[] }, void>({
      query: () => ({
        url: "/category/list?is_active=true",
        method: "GET",
      }),
      providesTags: ["Categories"],
    }),
  }),
});

export const { useGetCategoriesQuery } = categoryApi;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../../config";
export const productApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/product/list`,
  }),
  endpoints: (builder) => ({
    getProducts: builder.query<any[], void>({
      query: () => ``,
    }),
  }),
});

// Export hooks for usage in components
export const { useGetProductsQuery } = productApi;

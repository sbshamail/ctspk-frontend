import { createApi } from "@reduxjs/toolkit/query/react";
import { createPublicBaseQuery } from "./baseQuery";

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

export interface ContactFormResponse {
  success: number;
  detail: string;
  data?: any;
}

export const contactApi = createApi({
  reducerPath: "contactApi",
  baseQuery: createPublicBaseQuery(""),
  tagTypes: ["Contact"],
  endpoints: (builder) => ({
    submitSupport: builder.mutation<ContactFormResponse, ContactFormData>({
      query: (data) => ({
        url: "contactus/support",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useSubmitSupportMutation } = contactApi;

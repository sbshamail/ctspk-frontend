import { createApi } from "@reduxjs/toolkit/query/react";
import { createPublicBaseQuery } from "./baseQuery";

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  order: number;
}

export interface FAQType {
  id: string;
  name: string;
  icon?: string;
  questions: FAQItem[];
}

export interface FAQResponse {
  success: number;
  detail: string;
  data: FAQType[];
}

export const faqApi = createApi({
  reducerPath: "faqApi",
  baseQuery: createPublicBaseQuery(""),
  tagTypes: ["FAQ"],
  endpoints: (builder) => ({
    getGroupedFAQs: builder.query<FAQResponse, void>({
      query: () => ({
        url: "faq/grouped-by-type?is_active=true",
        method: "GET",
      }),
      providesTags: ["FAQ"],
    }),
  }),
});

export const { useGetGroupedFAQsQuery } = faqApi;

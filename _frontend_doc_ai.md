# My way to code FrontEnd Doc Ai

# We are making the multivender ecommerce website in modern and professional way

# in this project we use next15, typscript, shadcn, rtk and redux query

## skeleton

```js
//  product skeleton
const ProductCardSkeleton = () => {
  return (
    <div className="w-full rounded-lg border border-border bg-card shadow animate-pulse overflow-hidden">
      {/* Image section */}
      <div className="relative w-full h-56  bg-muted" />

      {/* Badge / top-left */}
      <div className="absolute top-3 left-3 h-5 w-14 rounded-md bg-accent" />

      {/* Action icons / top-right */}
      <div className="absolute top-3 right-3 flex space-x-2">
        <div className="h-7 w-7 rounded-full bg-muted" />
        <div className="h-7 w-7 rounded-full bg-muted" />
        <div className="h-7 w-7 rounded-full bg-muted" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <div className="h-4 w-3/4 rounded bg-muted" />

        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-5/6 rounded bg-muted" />
        </div>

        {/* Price + Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 w-16 rounded bg-primary" />
          <div className="h-8 w-20 rounded-md bg-secondary" />
        </div>
      </div>
    </div>

  );
};
export default ProductCardSkeleton;
// layout skeleton
const LayoutSkeleton = ({
  sidebar,
  header,
  footer,
  main,
}: {
  sidebar?: boolean;
  header?: boolean;
  footer?: boolean;
  main?: boolean;
}) => {
  return (
    <div className="flex flex-col  animate-pulse">
      {/* Header */}
      {header && (
        <header className="h-16 border-b border-border bg-card flex items-center px-4">
          <div className="h-6 w-32 rounded bg-muted" /> {/* Logo */}
          <div className="ml-auto flex space-x-4">
            <div className="h-6 w-6 rounded-full bg-muted" />
            <div className="h-6 w-6 rounded-full bg-muted" />
            <div className="h-6 w-6 rounded-full bg-muted" />
          </div>
        </header>
      )}
      <div className="flex flex-1">
        {/* Sidebar */}
        {sidebar && (
          <aside className="hidden md:flex md:flex-col w-64 border-r border-border bg-card p-4 space-y-4">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-4 w-3/5 rounded bg-muted" />
          </aside>
        )}
        {/* Main Content */}
        {main && (
          <main className="flex-1 p-6 space-y-6">
            {/* Section title */}
            <div className="h-6 w-48 rounded bg-muted" />

            {/* Cards grid */}
            <div className="h-[calc(100vh/2)] w-full rounded bg-muted" />
          </main>
        )}
      </div>
      {/* Footer */}
      {footer && (
        <footer className="h-14 border-t border-border bg-card flex items-center justify-center">
          <div className="h-4 w-32 rounded bg-muted" />
        </footer>
      )}
    </div>
  );
};

export default LayoutSkeleton;

```

## infinite scroll

```js
"use client";

import { useCallback, useEffect, useState } from "react";
import { InView } from "react-intersection-observer";
import ProductCardSkeleton from "../loaders/ProductCardSkeleton";
import ProductCard from "./ProductCard";

interface Props {
  defaultLimit: number;
  data: any[]; // Array of products passed from parent
  isLoading: boolean; // True only on the first API call
  isFetching: boolean; // True when fetching new pages
  error: any; // API error (if any)
  limit: number; // Items per page
  page: number; // Current page number
  count: number; // Total number of products from backend
  setPage: (p: number) => void; // Setter function to update page (from parent)
}

const ProductInfiniteScroll = ({
  defaultLimit,
  data,
  isLoading,
  isFetching,
  error,
  count,
  page,
  setPage,
  limit,
}: Props) => {
  // Store all loaded products
  const [allProducts, setAllProducts] = useState<any[]>([]);

  // Update local state whenever new data arrives from parent
  useEffect(() => {
    if (data && data.length > 0) {
      setAllProducts((prev) => [...prev, ...data]);
    }
  }, [data]);

  // Check if there are more products left to fetch
  const hasMore = allProducts.length < count;

  // Trigger when "InView" hits bottom of the page
  const handleViewChange = useCallback(
    (inView: boolean) => {
      if (inView && hasMore && !isFetching) {
        // Load next page
        setPage(page + 1);
      }
    },
    [hasMore, isFetching, page, setPage]
  );

  // Skeleton generator (placeholder while loading/fetching)
  const productSkeleton = () =>
    Array(defaultLimit)
      .fill(null)
      .map((_, index) => <ProductCardSkeleton key={index} />);

  // Show skeletons while first page is loading
  if (isLoading) return <>{productSkeleton()}</>;

  // Show error if API fails
  if (error) return <p>Error occurred while fetching products</p>;

  return (
    <>
      {/* Render all loaded products */}
      {allProducts.map((item, index) => (
        // @ts-ignore because product shape may vary
        <ProductCard key={index} {...item} />
      ))}

      {/* Show skeletons while fetching more pages */}
      {isFetching && productSkeleton()}

      {/* Load more when reaching bottom */}
      {hasMore && <InView as="div" onChange={handleViewChange} />}
    </>
  );
};

export default ProductInfiniteScroll;

```

## redux query

```js
// productApi
// src/redux/services/productApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../../config";

export type ProductQueryParams = {
  page: number; // current page number (1-based)
  limit: number; // number of items to return per page
  searchTerm?: string; // keyword search

  columnFilters?: [string, string | number | boolean][]; // e.g. [["name","car"],["description","product"]]
  numberRange?: [string, number, number]; // e.g. ["amount", 0, 1000]
  dateRange?: [string, string, string]; // e.g. ["created_at","01-01-2025","01-12-2025"]
};

export const toQueryString = (params: Record<string, any> = {}) => {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      let v = value;

      // If array or object, stringify
      if (Array.isArray(value) || typeof value === "object") {
        // Custom replacer: convert JS booleans to Python booleans
        v = JSON.stringify(value, (_k, val) => {
          if (val === true) return "True";
          if (val === false) return "False";
          return val;
        });
      }

      return `${encodeURIComponent(key)}=${encodeURIComponent(v)}`;
    })
    .join("&");

  return query;
};

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}`,
  }),
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    getProducts: builder.query<
      { data: any[]; total: number },
      ProductQueryParams
    >({
      query: (params) => {
        const query = toQueryString(params);
        return { url: `/product/list?${query}`, method: "GET" };
      },

      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const {
          page,
          limit,
          searchTerm = null,
          columnFilters = null,
          numberRange = null,
          dateRange = null,
        } = queryArgs;

        return `${endpointName}-${page}-${limit}-${searchTerm}-${columnFilters}-${numberRange}-${dateRange}`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (!currentCache || arg.page === 1) {
          return newItems;
        }

        // Prevent duplicate merges
        const existingIds = new Set(currentCache.data.map((item) => item.id));
        const mergedResults = [
          ...currentCache.data,
          ...newItems.data.filter((item) => !existingIds.has(item.id)),
        ];

        return { data: mergedResults, total: newItems.total };
      },

      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.page !== previousArg?.page ||
          currentArg?.limit !== previousArg?.limit ||
          currentArg?.searchTerm !== previousArg?.searchTerm ||
          currentArg?.columnFilters !== previousArg?.columnFilters ||
          currentArg?.dateRange !== previousArg?.dateRange ||
          currentArg?.numberRange !== previousArg?.numberRange
        );
      },
    }),
  }),
});

export const { useGetProductsQuery } = productApi;

```

# Types

```ts
// react Types
export type InputElementType = React.ChangeEvent<HTMLInputElement>;
export type ChildrenType = React.ReactNode;
export type ClassNameType = React.ComponentProps<"div">["className"];

// model Types
export interface CategoryDataType {
  [key: string]: any;
  id?: number;
  image?: string;
  is_active: boolean;
  name: string;
  slug: string;
  children?: CategoryDataType[];
  created_at: string;
  parent_id?: number;
}

export interface ProductDataType {
  [key: string]: any;
  id?: number;
  title?: string;
  images?: string[];
  rating?: number;
  price?: number;
  salePrice?: number;
  reviews?: number;
  sku?: string;
  category?: { id: number; name: string };
}
```

# helpers

```js
// if you start with [1, 2, 3, 4, 5], the shuffled array might be [3, 2, 5, 1, 4] or [5, 1, 4, 3, 2], depending on the random indices generated during the shuffle process.
export function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// // testOne  == Test One
export const capitalizeCamelSpace = (name: string) => {
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1);

  return capitalized.replace(/([A-Z])/g, " $1").trim();
};

export const currencyFormatter = (
  value: number,
  currency: "PKR" | "SAR" | "EUR" | "JPY" | "USD" | "INR" | null = "PKR",
  format: "en-PK" | "en-US" | "de-DE" | "ja-JP" | "en-IN" = "en-PK"
): string => {
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
  };

  if (currency) {
    options.style = "currency";
    options.currency = currency;
  }

  const numberFormatter = new Intl.NumberFormat(format, options);

  // We format the absolute value of the provided number to handle both positive and negative values.
  let formattedValue = numberFormatter.format(Math.abs(value));

  // If the value is negative, adjust the formatting
  if (value < 0) {
    if (currency) {
      formattedValue = formattedValue.replace(/^(\D+)/, "$1-");
    } else {
      formattedValue = `-${formattedValue}`;
    }
  }

  return formattedValue;
};

export const titleSubstring = (
  title: string,
  length: number = 35,
  max: number = 25
) => {
  if (title && title.length > length) {
    return title.substring(0, max) + "...";
  }
  return title;
};

export function seoTitle(title: string): string {
  return title
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .trim() // Trim whitespace
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with a single hyphen
}
```

# action

```js
// fetchapi
import { API_URL } from "../../config";

interface IFetchApi {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  options?: RequestInit;
}

export const fetchApi = async ({ url, method = "GET", options }: IFetchApi) => {
  try {
    const baseUrl = `${API_URL}/${url}`;
    const response = await fetch(baseUrl, {
      method,
      ...options,
    });

    if (!response.ok) {
      console.error(`API error: ${response.status} - ${response.statusText}`);
      return null; // 👈 instead of throwing
    }

    return response.json();
  } catch (error) {
    console.error("fetchApi error:", error);
    return null; // 👈 safe fallback
  }
};
```

# @core

```js
import { cn } from "@/lib/utils";
import { ChildrenType, ClassNameType } from "@/utils/reactTypes";

export const Screen = ({
  children,
  className,
}: {
  children: ChildrenType,
  className?: ClassNameType,
}) => {
  return (
    <div>
      <div
        className={cn(
          "mx-auto 3xl:max-w-[1600px] 2xl:max-w-[1400px] max-w-6xl px-2",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};
```

# My way to code FrontEnd Doc Ai

# We are making the multivender ecommerce website in modern and professional way

# in this project we use next15, typscript, shadcn, rtk and redux query

## Forms

```js

```

//=========================================

## skeleton

// =======================================

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

// =======================================

## infinite scroll

// =======================================

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

// =======================================

## Redux Query ===========================

// =======================================

```js
// =========================================
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
// ====================================================
// CategoryApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../../config";

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}`,
  }),
  tagTypes: ["Categories"],
  endpoints: (builder) => ({
    getCategories: builder.query<{ data: any[] }, void>({
      query: () => ({
        url: "/category/list",
        method: "GET",
      }),
      providesTags: ["Categories"],
    }),
  }),
});
// Cart api
export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/cart`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.data?.access_token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    // ---------- GET CART ----------
    getCart: builder.query<any, void>({
      query: () => "/list",
      providesTags: ["Cart"],
      transformResponse: (res: any) => res.data ?? [], // keep only array
    }),
    // ---------- ADD CART ----------
    addToCart: builder.mutation({
      query: (body) => ({
        url: "/create",
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data: res } = await queryFulfilled;
          const newItem = res?.data;
          // Patch local cache of getCart
          dispatch(
            cartApi.util.updateQueryData("getCart", undefined, (draft) => {
              if (!Array.isArray(draft)) return;
              const idx = draft.findIndex(
                (i: CartItemType) => i.product.id === newItem.product.id
              );
              if (idx >= 0) draft[idx] = newItem;
              else draft.push(newItem);
            })
          );
        } catch {}
      },
    }),
      }),
});


export const { useGetCategoriesQuery } = categoryApi;

```

// =======================================

# Reuse Reducer ========================

// =======================================

```ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InitialState<T> {
  data: T | null;
}

export const generateReducer = <T>(name: string) => {
  const initialState: InitialState<T> = { data: null };
  const slice = createSlice({
    name,
    initialState,
    reducers: {
      setData: (state, action: PayloadAction<any>) => {
        state.data = action.payload;
      },
    },
  });
  return { reducer: slice.reducer, actions: slice.actions };
};

export const setReducer = <T>(name: string) => {
  const myReducer = generateReducer<T>(name);
  const { setData } = myReducer.actions;
  return setData;
};
// how to work
//save on reducer first "name: generateReducer<[]>('name').reducer,"
// const setName = setReducer('name');
// dispatch(setName(data))

// ================================
// Store
import { CartItemType } from "@/utils/modelTypes";
import { configureStore } from "@reduxjs/toolkit";
import { generateReducer } from "./common/action-reducer";
import authReducer from "./features/authSlice";
import loadingReducer from "./features/loadingSlice";
import cartReducer from "./features/localCartSlice";
import { cartApi } from "./services/cartApi";
import { categoryApi } from "./services/categoryApi";
import { productApi } from "./services/productApi";
export const makeStore = () =>
  configureStore({
    reducer: {
      // Add API reducer when you create it
      [productApi.reducerPath]: productApi.reducer,
      [categoryApi.reducerPath]: categoryApi.reducer,
      [cartApi.reducerPath]: cartApi.reducer,
      localCart: cartReducer,
      auth: authReducer,
      loading: loadingReducer,
      selectedCart: generateReducer<CartItemType[]>("selectedCart").reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        productApi.middleware,
        categoryApi.middleware,
        cartApi.middleware
      ), // Add API middleware(),
  });

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
```

// =======================================

# Types ===========================

// =======================================

```ts
// ===========================
// react Types
export type InputElementType = React.ChangeEvent<HTMLInputElement>;
export type ChildrenType = React.ReactNode;
export type ClassNameType = React.ComponentProps<"div">["className"];

// ===========================
// model Types

export interface ImageType {
  original: string;
  filename: string;
  thumbnail?: string;
  media_type?: string;
}
export * from "./AuthType";
export * from "./cartType";

export interface CategoryDataType {
  [key: string]: any;
  id?: number;
  image?: ImageType;
  description?: string;
  root_id: number;
  is_active: boolean;
  name: string;
  slug: string;
  children?: CategoryDataType[];
  created_at: string;
  parent_id?: number;
}

export interface ProductDataType {
  [key: string]: any;
  id: number;
  name: string;
  gallery?: ImageType[];
  image?: ImageType;
  rating?: number;
  price?: number;
  salePrice?: number;
  reviews?: number;
  sku?: string;
  category?: { id: number; name: string };
}

//cartType
type Product = {
  id: number;
  name: string;
  price: number;
  salePrice?: number;
  image: ImageType;
};
export interface CartItemType {
  quantity: number;
  product: Product;
  shop_id: number;
}

// Role type
export interface RoleType {
  id: number;
  name: string;
  permissions: string[];
  created_at: string;
  updated_at?: string | null;
  user_id?: number;
}

// Shop type
export interface AuthShopType {
  id: number;
  name: string;
}

// User type (nested inside Auth)
export interface UserDataType {
  id: number;
  name: string;
  phone_no?: string;
  image?: ImageType;
  email: string;
  is_active: boolean;
  roles: RoleType[];
  shops: AuthShopType[];
  created_at: string;
  updated_at?: string | null;
}

// Auth response root type
export interface AuthDataType {
  message: string;
  token_type: string; // "bearer"
  access_token: string;
  refresh_token: string;
  user: UserDataType;
  exp: string; // ISO timestamp like "2025-10-12T12:46:29.929459+00:00"
}
```

// =======================================

# Helper ===========================

// =======================================

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

// =======================================

# Action ===========================

// =======================================

```js
// fetchapi
import { API_URL } from "../../config";
import { getSession } from "./auth";
interface IFetchApi {
  url: string;
  token?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: Record<string, any> | FormData; // JSON body or FormData
  options?: RequestInit; // Extra fetch options (headers, etc.)
}

export const fetchApi = async ({
  url,
  method = "GET",
  data,
  token,
  options,
}: IFetchApi) => {
  const sessionToken = await getSession("access_token");
  try {
    const baseUrl = `${API_URL}/${url}`;

    // ✅ Start building headers
    const headers: Record<string, string> = {
      ...(options?.headers as Record<string, string>),
    };

    // ✅ Add Authorization header if token exists
    if (token || sessionToken) {
      headers["Authorization"] = `Bearer ${token || sessionToken}`;
    }

    // Build request init
    let fetchOptions: RequestInit = {
      method,
      headers,
      ...options,
    };

    // Handle body data
    if (data) {
      if (data instanceof FormData) {
        // ✅ FormData (let browser set headers automatically)
        fetchOptions.body = data;
      } else {
        // ✅ JSON data
        fetchOptions.body = JSON.stringify(data);
        fetchOptions.headers = {
          ...headers,
          "Content-Type": "application/json",
        };
      }
    }

    const response = await fetch(baseUrl, fetchOptions);

    if (!response.ok) {
      console.log(`API error: ${response.status} - ${response.statusText}`);
      return null;
    }

    // Try to parse JSON safely
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    return response.text();
  } catch (error) {
    console.log("fetchApi error:", error);
    return null;
  }
};

```

// =======================================

# Core ===========================

// =======================================

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

// ==================
// Hooks
import { useEffect, useRef } from "react";
/**
 * Run effect only on updates (not on first mount)
 */
export function useDidUpdateEffect(
  effect: React.EffectCallback,
  deps: React.DependencyList
) {
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    return effect();
  }, deps);
}
import { useMemo, useRef } from "react";

export function useDebounce<T extends (...args: any[]) => void>(
  fn: T,
  delay = 300,
  getKey?: (...args: Parameters<T>) => string | number
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const timers = useRef<Record<string | number, ReturnType<typeof setTimeout>>>(
    {}
  );

  const debouncedFn = useMemo(() => {
    return (...args: Parameters<T>) => {
      const key = getKey ? getKey(...args) : "default";

      if (timers.current[key]) clearTimeout(timers.current[key]);

      timers.current[key] = setTimeout(() => {
        delete timers.current[key];
        fnRef.current(...args);
      }, delay);
    };
  }, [delay, getKey]);

  return debouncedFn;
}


```

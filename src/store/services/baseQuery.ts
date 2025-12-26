import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../../config";
import Cookies from "js-cookie";
import { Mutex } from "async-mutex";

// Create a mutex to prevent multiple refresh attempts
const mutex = new Mutex();

/**
 * Custom base query with automatic token refresh on 401 errors
 *
 * How it works:
 * 1. Makes the initial request with the access token
 * 2. If 401 is returned, acquires a mutex lock
 * 3. Calls /refresh endpoint with refresh_token from cookies
 * 4. Updates the access_token cookie with the new token
 * 5. Retries the original failed request with the new token
 */
export const baseQueryWithReauth: (
  baseUrl: string
) => BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = (
  baseUrl: string
) => {
  const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      // Try to get token from Redux state first
      const token = (getState() as any).auth?.data?.access_token;

      // Fallback to cookie if not in Redux
      const cookieToken = Cookies.get("access_token");
      const finalToken = token || cookieToken;

      if (finalToken) {
        headers.set("Authorization", `Bearer ${finalToken}`);
      }
      return headers;
    },
  });

  return async (args, api, extraOptions) => {
    // Wait for any ongoing refresh to complete
    await mutex.waitForUnlock();

    let result = await baseQuery(args, api, extraOptions);

    // Check if we got a 401 Unauthorized error
    if (result.error && result.error.status === 401) {
      // Check if mutex is already locked (another request is refreshing)
      if (!mutex.isLocked()) {
        const release = await mutex.acquire();

        try {
          // Get refresh token from cookies
          const refreshToken = Cookies.get("refresh_token");

          if (!refreshToken) {
            console.error("No refresh token available");
            // Clear session and redirect to login could be done here
            release();
            return result;
          }

          // Call refresh endpoint with token as query parameter
          const refreshResult = await baseQuery(
            {
              url: `${API_URL}/refresh?refresh_token=${refreshToken}`,
              method: "POST",
            },
            api,
            extraOptions
          );

          if (refreshResult.data) {
            // Extract new tokens from response
            const data = refreshResult.data as any;
            const newAccessToken = data.access_token || data.data?.access_token;
            const newRefreshToken = data.refresh_token || data.data?.refresh_token;
           
            const newExp = data.exp || data.data?.exp;
            const user = data.user || data.data?.user;


            if (newAccessToken) {
              // Update access token in cookie
              Cookies.set("access_token", newAccessToken, {
                secure: true,
                sameSite: "Strict",
              });

              // Update refresh token if provided
              if (newRefreshToken) {
                Cookies.set("refresh_token", newRefreshToken, {
                  secure: true,
                  sameSite: "Strict",
                });
              }
              if (newExp) {
                Cookies.set("user_session_exp", newExp, {
                  secure: true,
                  sameSite: "Strict",
                });
              }
              // Update Redux state if auth slice exists
              const authState = (api.getState() as any).auth;
              if (authState) {
                api.dispatch({
                  type: "auth/updateToken",
                  payload: {
                    access_token: newAccessToken,
                    refresh_token: newRefreshToken,
                    user_session_exp: newExp || authState?.user_session_exp,
                  },
                });
              }

              // Retry the original request with new token
              result = await baseQuery(args, api, extraOptions);
            }
          } else {
            // Refresh failed - clear session
            console.error("Token refresh failed");
            Cookies.remove("access_token");
            Cookies.remove("refresh_token");
            Cookies.remove("user_session");
            Cookies.remove("user_session_exp");

            // Optional: Dispatch logout action
            api.dispatch({ type: "auth/logout" });
          }
        } finally {
          release();
        }
      } else {
        // Wait for the refresh to complete and retry
        await mutex.waitForUnlock();
        result = await baseQuery(args, api, extraOptions);
      }
    }

    return result;
  };
};

/**
 * Helper to create a base query for a specific API endpoint
 * Usage: createBaseQuery('/cart')
 */
export const createBaseQuery = (endpoint: string) => {
  return baseQueryWithReauth(`${API_URL}${endpoint}`);
};

/**
 * Helper to create a base query without authentication
 * For public endpoints like products, categories, etc.
 * Usage: createPublicBaseQuery('')
 */
export const createPublicBaseQuery = (endpoint: string = "") => {
  return fetchBaseQuery({
    baseUrl: `${API_URL}${endpoint}`,
  });
};

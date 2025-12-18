"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { clearSession } from "@/action/auth";
import { setAuth, logoutUser } from "@/store/features/authSlice";
import { useGetUnreadCountQuery } from "@/store/services/notificationApi";

interface SessionManagerProps {
  children: React.ReactNode;
}

// API URL from environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function SessionManager({ children }: SessionManagerProps) {
  const dispatch = useDispatch();
  const auth = useSelector((state: any) => state.auth);
  const isRefreshing = useRef(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount and when auth changes
  useEffect(() => {
    const token = Cookies.get("access_token");
    setIsAuthenticated(!!token);
  }, [auth]);

  // Unread count query - skip if not authenticated, poll every 1 minute
  useGetUnreadCountQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 60000, // Poll every 1 minute (60000ms)
  });

  // Check if session is about to expire (less than 10 minutes remaining)
  const isSessionExpiringSoon = useCallback(() => {
    const sessionExp = Cookies.get("user_session_exp");
    if (!sessionExp) return false;

    try {
      const expDate = new Date(sessionExp);
      const now = new Date();
      const diffInMinutes = (expDate.getTime() - now.getTime()) / (1000 * 60);

      // Return true if less than 10 minutes remaining
      return diffInMinutes > 0 && diffInMinutes < 10;
    } catch (error) {
      console.error("Error parsing session expiration:", error);
      return false;
    }
  }, []);

  // Check if session is expired
  const isSessionExpired = useCallback(() => {
    const sessionExp = Cookies.get("user_session_exp");
    if (!sessionExp) return true;

    try {
      const expDate = new Date(sessionExp);
      const now = new Date();
      return now >= expDate;
    } catch (error) {
      console.error("Error parsing session expiration:", error);
      return true;
    }
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    if (isRefreshing.current) return false;

    const refreshTokenValue = Cookies.get("refresh_token");
    if (!refreshTokenValue) {
      console.error("No refresh token available");
      return false;
    }

    isRefreshing.current = true;

    try {
      const response = await fetch(
        `${API_URL}/refresh?refresh_token=${refreshTokenValue}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newAccessToken = data.access_token || data.data?.access_token;
        const newRefreshToken = data.refresh_token || data.data?.refresh_token;
        const newExp = data.exp || data.data?.exp;
        const user = data.user || data.data?.user;

        if (newAccessToken) {
          // Update cookies
          Cookies.set("access_token", newAccessToken, {
            secure: true,
            sameSite: "Strict",
          });

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

          // Update Redux state
          dispatch(
            setAuth({
              ...auth,
              access_token: newAccessToken,
              refresh_token: newRefreshToken || auth?.refresh_token,
              user_session_exp: newExp || auth?.user_session_exp,
            })
          );

          console.log("Token refreshed successfully");
          return true;
        }
      } else {
        console.error("Token refresh failed with status:", response.status);
        // If refresh fails, clear session and logout
        clearSession();
        dispatch(logoutUser());
        return false;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    } finally {
      isRefreshing.current = false;
    }

    return false;
  }, [auth, dispatch]);

  // Main effect for session management
  useEffect(() => {
    const accessToken = Cookies.get("access_token");
    if (!accessToken) return;

    // Check session on mount
    const checkSession = async () => {
      if (isSessionExpired()) {
        console.log("Session expired, attempting refresh...");
        const refreshed = await refreshToken();
        if (!refreshed) {
          clearSession();
          dispatch(logoutUser());
        }
      } else if (isSessionExpiringSoon()) {
        console.log("Session expiring soon, refreshing proactively...");
        await refreshToken();
      }
    };

    // Initial check
    checkSession();

    // Set up interval to check session every minute
    const sessionCheckInterval = setInterval(() => {
      if (isSessionExpiringSoon()) {
        console.log("Session expiring soon, refreshing...");
        refreshToken();
      }
    }, 60000); // Check every 1 minute

    return () => {
      clearInterval(sessionCheckInterval);
    };
  }, [isSessionExpired, isSessionExpiringSoon, refreshToken, dispatch]);

  return <>{children}</>;
}

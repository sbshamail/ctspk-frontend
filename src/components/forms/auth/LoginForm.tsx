"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";

import { saveSession } from "@/action/auth";
import { fetchApi } from "@/action/fetchApi";
import { authLoading, setAuth } from "@/store/features/authSlice";

import { InputField } from "@/components/formFields/InputField";
import { PasswordField } from "@/components/formFields/PasswordField";
import { useSelection } from "@/lib/useSelection";
import { loginSchema, LoginSchemaType } from "@/schemas";
// cart
import { clearCart } from "@/store/features/localCartSlice";
import { cartApi } from "@/store/services/cartApi";
import ForgotPasswordModal from "./ForgotPasswordModal";

interface LoginFormProps {
  close: () => void;
}

export function LoginForm({ close }: LoginFormProps) {
  // const dispatch = useAppDispatch();
  const { items: cartItems, dispatch } = useSelection("localCart", true);
  const [openForgot, setOpenForgot] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  const [error, setError] = React.useState<string | null>(null);

  // Function to sync local cart to backend after successful login
  const syncCartToBackend = async (accessToken: string) => {
    try {
      // Get cart from localStorage
      // const localCart = localStorage.getItem('myapp_cart');

      if (cartItems) {
        if (Array.isArray(cartItems) && cartItems.length > 0) {
          // Transform cart items to match backend format
          const items = cartItems.map((item) => ({
            product_id: item.product?.id || 0,
            shop_id: item.shop_id || 0,
            quantity: item.quantity || 1,
            variation_option_id: item.variation_option_id || null,
          }));
          // Call bulk create API
          const response = await fetchApi({
            url: "cart/bulk-create",
            method: "POST",
            data: { items },
          });

          if (response) {
            // Clear local cart after successful sync
            dispatch(clearCart());
            dispatch(
              cartApi.endpoints.getCart.initiate(undefined, {
                forceRefetch: true,
              })
            );
            console.log("Cart synced successfully");
          } else {
            console.warn("Failed to sync cart:", response?.detail);
          }
        }
      }
    } catch (error) {
      console.error("Error syncing cart:", error);
    }
  };

  const onSubmit = async (values: LoginSchemaType) => {
    dispatch(authLoading(true));
    setError(null);

    try {
      const login = await fetchApi({
        url: "login",
        method: "POST",
        options: {
          body: JSON.stringify(values),
          headers: { "Content-Type": "application/json" },
        },
      });

      if (login?.data) {
        const { access_token, refresh_token, user, exp } = login.data;

        // Set auth in Redux store and save session
        dispatch(setAuth(login.data));
        saveSession(user, access_token, refresh_token, exp);

        // Sync cart to backend after successful login
        await syncCartToBackend(access_token);

        close();
      } else {
        setError("Invalid email or password.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      dispatch(authLoading(false));
    }
  };

  return (
    <>
      <ForgotPasswordModal open={openForgot} setOpen={setOpenForgot} />
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <InputField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          register={register}
          error={errors.email}
          autoComplete="email"
        />

        <PasswordField
          id="password"
          label="Password"
          placeholder="••••••••"
          register={register}
          error={errors.password}
          autoComplete="current-password"
        />

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setOpenForgot(true)}
            className="text-sm text-primary underline underline-offset-4"
          >
            Forgot password?
          </button>
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground hover:opacity-90"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </>
  );
}

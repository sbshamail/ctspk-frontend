"use client";
import Link from "next/link";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";

import { fetchApi } from "@/action/fetchApi";
import { saveSession } from "@/action/auth";
import { useAppDispatch } from "@/lib/hooks";
import { authLoading, setAuth } from "@/store/features/authSlice";

import { loginSchema, LoginSchemaType } from "@/schemas";
import { InputField } from "@/components/formFields/InputField";
import { PasswordField } from "@/components/formFields/PasswordField";

interface LoginFormProps {
  close: () => void;
}

export function LoginForm({ close }: LoginFormProps) {
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  const [error, setError] = React.useState<string | null>(null);

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
        dispatch(setAuth(login.data));
        saveSession(user, access_token, refresh_token, exp);
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
        <Link
          href="#"
          className="text-sm text-primary underline underline-offset-4"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-primary-foreground hover:opacity-90"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

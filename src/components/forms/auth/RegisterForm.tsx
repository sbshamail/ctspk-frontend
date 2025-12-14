"use client";

import { fetchApi } from "@/action/fetchApi";
import { saveSession } from "@/action/auth";
import { InputField } from "@/components/formFields/InputField";
import { PasswordField } from "@/components/formFields/PasswordField";
import { Button } from "@/components/ui/button";
import { setAuth } from "@/store/features/authSlice";
import { useSelection } from "@/lib/useSelection";

import { registerSchema, RegisterSchemaType } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
const getApiUrl = (endpoint: string) => {
const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  // Remove trailing slash from baseUrl and leading slash from endpoint if needed
  const formattedBaseUrl = baseUrl.replace(/\/$/, '');
  const formattedEndpoint = endpoint.replace(/^\//, '');
  return `${formattedBaseUrl}/${formattedEndpoint}`;
};
interface Props {
  close: () => void;
  setSiginModal: React.Dispatch<React.SetStateAction<boolean>>;
}
export function RegisterForm({ close, setSiginModal }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const { dispatch } = useSelection("auth", true);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterSchemaType) => {
    setServerError(null);
    try {
      const response = await fetch(getApiUrl('/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      let res;
      try {
        res = await response.json();
      } catch (parseError) {
        // If JSON parsing fails
        const errorMessage = "Invalid response from server.";
        setServerError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      console.log("Status:", response.status);
      console.log("Response:", res);

      // Check both status code and success flag
      if (response.ok && res?.success === 1) {
        // Successfully registered - now auto-login the user
        const { access_token, refresh_token, user, exp } = res.data;

        // Set auth in Redux store and save session (same as login)
        dispatch(setAuth(res.data));
        saveSession(user, access_token, refresh_token, exp);

        // Show success toast
        toast.success(res.detail || "Account created successfully!");

        // Reset form and close modal
        reset();
        router.refresh();
        close();
      } else {
        // Handle both HTTP errors and API business logic errors
        const errorMessage = res?.detail ||
                            `Request failed with status ${response.status}` ||
                            "Something went wrong. Please try again.";
        setServerError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.log("Network error:", err);
      const errorMessage = "Network error. Please try again.";
      setServerError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <InputField
        id="name"
        label="Full Name"
        placeholder="Your full name"
        register={register}
        error={errors.name}
        autoComplete="name"
      />

      <InputField
        id="email"
        label="Email"
        placeholder="you@example.com"
        type="email"
        register={register}
        error={errors.email}
        autoComplete="email"
      />

      <InputField
        id="phone_no"
        label="Phone Number"
        placeholder="923001234567"
        type="tel"
        register={register}
        error={errors.phone_no}
        autoComplete="tel"
      />

      <PasswordField
        id="password"
        label="Password"
        placeholder="Create a strong password"
        register={register}
        error={errors.password}
        autoComplete="new-password"
      />

      <PasswordField
        id="confirm_password"
        label="Confirm Password"
        placeholder="Repeat your password"
        register={register}
        error={errors.confirm_password}
        autoComplete="new-password"
      />

      {serverError && (
        <p role="alert" className="text-sm text-destructive">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-primary-foreground hover:opacity-90"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}

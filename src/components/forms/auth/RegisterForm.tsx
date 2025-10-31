"use client";

import { fetchApi } from "@/action/fetchApi";
import { InputField } from "@/components/formFields/InputField";
import { PasswordField } from "@/components/formFields/PasswordField";
import { Button } from "@/components/ui/button";

import { registerSchema, RegisterSchemaType } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
interface Props {
  close: () => void;
  setSiginModal: React.Dispatch<React.SetStateAction<boolean>>;
}
export function RegisterForm({ close, setSiginModal }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
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
      const res = await fetchApi({
        url: "register",
        method: "POST",
        data: values,
      });

      if (res?.success) {
        reset();
        close();
        setSiginModal(true);
      } else {
        setServerError(
          res?.detail || "Something went wrong. Please try again."
        );
      }
    } catch (err) {
      setServerError("Network error. Please try again.");
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

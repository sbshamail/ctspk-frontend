# My way to code FrontEnd Doc Ai For Zod Forms

# packages react-hook-form,zod,@hookform/resolvers/zod

## We are making the multivender ecommerce website in modern and professional way

## in this project we use next15, typscript, shadcn, rtk and redux query

## Forms

```js
// Register Form
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

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] =
    (React.useState < string) | (null > null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm <
  RegisterSchemaType >
  {
    resolver: zodResolver(registerSchema),
  };

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
        router.push("/login");
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
export type RegisterSchemaType = z.infer<typeof registerSchema>;

// Schemas Define
export const registerSchema = z
  .object({
    name: zodType.user_name,

    email: zodType.email,

    phone_no: zodType.phone_no,

    password: zodType.password,

    confirm_password: zodType.confirm_password,
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });
// common zod
import z from "zod";

export const zodType = {
  user_name: z.string().min(1, { message: "Name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Enter a valid email address",
    }),
  phone_no: z
    .string()
    .min(1, { message: "Phone number is required" })
    .refine((val) => /^\d{10,15}$/.test(val), {
      message: "Enter a valid phone number (10–15 digits)",
    }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  confirm_password: z
    .string()
    .min(6, { message: "Confirm password is required" }),
};

// Input Field
("use client");

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FieldError } from "react-hook-form";
import { InputElementType } from "@/utils/reactTypes";

interface InputFieldProps {
  id: string;
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: InputElementType) => void;
  error?: FieldError | string | null;
  register?: any; // react-hook-form register
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
}

export const InputField = ({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  register,
  disabled,
  required,
  autoComplete,
}: InputFieldProps) => {
  const inputProps = register
    ? { ...register(id) }
    : { id, value, onChange, required, autoComplete };

  return (
    <div className="grid gap-2">
      {label && <Label htmlFor={id}>{label}</Label>}

      <Input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "focus-visible:ring-2 focus-visible:ring-primary",
          error && "border-destructive focus-visible:ring-destructive"
        )}
        {...inputProps}
      />

      {error && (
        <p className="text-sm text-destructive mt-1">
          {typeof error === "string" ? error : error.message}
        </p>
      )}
    </div>
  );
};
```

"use client";

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

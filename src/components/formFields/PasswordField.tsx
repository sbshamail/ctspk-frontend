"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { FieldError } from "react-hook-form";
import { InputElementType } from "@/utils/reactTypes";

interface PasswordFieldProps {
  id: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: InputElementType) => void;
  error?: FieldError | string | null;
  register?: any; // react-hook-form register
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
}

export const PasswordField = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  register,
  disabled,
  required,
  autoComplete = "current-password",
}: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputProps = register
    ? { ...register(id) }
    : { id, value, onChange, required, autoComplete };

  return (
    <div className="grid gap-2 relative">
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pr-10 focus-visible:ring-2 focus-visible:ring-primary",
            error && "border-destructive focus-visible:ring-destructive"
          )}
          {...inputProps}
        />

        {/* 👁️ Eye toggle button */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
          tabIndex={-1} // prevent form submission
        >
          {showPassword ? (
            <EyeOff size={18} strokeWidth={1.8} />
          ) : (
            <Eye size={18} strokeWidth={1.8} />
          )}
        </button>
      </div>

      {error && (
        <p className="text-sm text-destructive mt-1">
          {typeof error === "string" ? error : error.message}
        </p>
      )}
    </div>
  );
};

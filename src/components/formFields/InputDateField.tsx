// components/formFields/InputDateField.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import React from "react";
import { Control, Controller } from "react-hook-form";

export interface InputDateFieldProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string | null; // ISO date 'YYYY-MM-DD' or empty
  onChange?: (val: string | null) => void;
  required?: boolean;
  disabled?: boolean;

  // react-hook-form support (optional)
  control?: Control<any>;
  name?: string;
  // optional class
  className?: string;
}

export default function InputDateField({
  id,
  label,
  placeholder,
  value,
  onChange,
  required,
  disabled,
  control,
  name,
  className,
}: InputDateFieldProps) {
  // controlled mode
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value || null;
    onChange?.(v);
  };

  const inputEl = (
    <div className={`flex items-center space-x-2 ${className ?? ""}`}>
      <Input
        id={id}
        type="date"
        value={value ?? ""}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
      <Calendar className="w-4 h-4 opacity-60" />
    </div>
  );

  if (control && name) {
    return (
      <div>
        {label && <Label htmlFor={id}>{label}</Label>}
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <div className="flex items-center space-x-2">
              <Input
                {...field}
                id={id}
                type="date"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value || null)}
                placeholder={placeholder}
                disabled={disabled}
              />
              <Calendar className="w-4 h-4 opacity-60" />
            </div>
          )}
        />
      </div>
    );
  }

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      {inputEl}
    </div>
  );
}

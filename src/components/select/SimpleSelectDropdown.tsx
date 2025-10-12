"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClassNameType } from "@/utils/reactTypes";

export type DropdownOption<T = any> = {
  label: string;
  value: T;
};

interface SimpleDropdownProps<T = any> {
  options: DropdownOption<T>[];
  value?: T;
  defaultValue?: T;
  title?: string;
  contentClassName?: ClassNameType;
  onChange?: (value: T) => void;
}

const SimpleSelectDropdown = <T,>({
  options,
  value,
  defaultValue,
  title = "Select",
  contentClassName,
  onChange,
}: SimpleDropdownProps<T>) => {
  const [selected, setSelected] = useState<DropdownOption<T> | undefined>(
    () =>
      options.find(
        (o) => JSON.stringify(o.value) === JSON.stringify(defaultValue)
      ) || options[0]
  );

  useEffect(() => {
    if (value !== undefined) {
      const match = options.find(
        (o) => JSON.stringify(o.value) === JSON.stringify(value)
      );
      if (match) setSelected(match);
    }
  }, [value, options]);

  const handleSelect = (option: DropdownOption<T>) => {
    setSelected(option);
    onChange?.(option.value);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-between gap-2"
        >
          {selected?.label || title}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn("w-48", contentClassName)}>
        {title && <DropdownMenuLabel>{title}</DropdownMenuLabel>}
        {title && <DropdownMenuSeparator />}
        {options.map((option) => (
          <DropdownMenuItem
            key={String(option.label)}
            onClick={() => handleSelect(option)}
            className={
              JSON.stringify(selected?.value) === JSON.stringify(option.value)
                ? "bg-muted font-medium"
                : ""
            }
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SimpleSelectDropdown;

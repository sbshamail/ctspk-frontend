// components/table/filters/GlobalFilter.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type GlobalFilterType = {
  globalFilter?: string | null;
  setGlobalFilter?: (v: string | null) => void;
  placeholder?: string;
  debounceMs?: number;
};

export default function GlobalFilter({
  globalFilter,
  setGlobalFilter,
  placeholder = "Search...",
  debounceMs = 350,
}: GlobalFilterType) {
  const [value, setValue] = useState(globalFilter ?? "");
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setValue(globalFilter ?? "");
  }, [globalFilter]);

  useEffect(() => {
    // cleanup
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const onChange = (v: string) => {
    setValue(v);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setGlobalFilter?.(v.trim() ? v : null);
    }, debounceMs);
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center border border-border rounded-md p-1 px-2">
        <Search className="w-4 h-4 opacity-70" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="border-none"
        />
      </div>
    </div>
  );
}

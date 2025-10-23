"use client";

import InputDateField from "@/components/formFields/InputDateField";
import { Button } from "@/components/ui/button";

export interface FromToDateFilterTypes {
  fromDate?: string | null;
  setFromDate?: (d: string | null) => void;
  toDate?: string | null;
  setToDate?: (d: string | null) => void;
  // optional quick presets
  showClear?: boolean;
}

export default function FromToDateFilter({
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  showClear = true,
}: FromToDateFilterTypes) {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex flex-col">
        <span className="text-xs font-medium">From</span>
        <InputDateField
          value={fromDate ?? ""}
          onChange={(v) => setFromDate?.(v)}
          placeholder="Start date"
        />
      </div>

      <div className="flex flex-col">
        <span className="text-xs font-medium">To</span>
        <InputDateField
          value={toDate ?? ""}
          onChange={(v) => setToDate?.(v)}
          placeholder="End date"
        />
      </div>

      {showClear && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFromDate?.(null);
            setToDate?.(null);
          }}
          className="ml-1"
        >
          Clear
        </Button>
      )}
    </div>
  );
}

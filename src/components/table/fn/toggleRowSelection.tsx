import { Checkbox } from "@/components/ui/checkbox";
import React from "react";

/**
 * Safely access nested property in an object using dot notation.
 * Example: getNestedProperty(row, "product.id")
 */
function getNestedProperty(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

/**
 * Toggles the selection of a single row in a table (supports nested ids like "product.id")
 */
export function toggleRowSelection<T extends Record<string, any>>(
  row: T,
  idProperty: keyof T | string,
  selectedRows: T[],
  setSelectedRows:
    | React.Dispatch<React.SetStateAction<T[]>>
    | ((rows: T[]) => void)
) {
  const id = getNestedProperty(row, idProperty as string);

  const isSelected = selectedRows.some(
    (s) => getNestedProperty(s, idProperty as string) === id
  );

  const toggle = () => {
    if (isSelected) {
      setSelectedRows(
        selectedRows.filter(
          (s) => getNestedProperty(s, idProperty as string) !== id
        )
      );
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  };

  return <Checkbox checked={isSelected} onCheckedChange={toggle} />;
}

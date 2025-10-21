import { currencyFormatter } from "@/utils/helper";
import React from "react";
import { ColumnType } from "../MainTable";

export const renderCell = <T,>(
  item: T,
  column: ColumnType<T>,
  index: number,
  data: T[]
) => {
  const accessors = column.accessor?.toString().split(".");
  let value: any = item;
  accessors?.forEach((key) => {
    value = value?.[key as keyof typeof value];
  });

  if (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !React.isValidElement(value)
  ) {
    value = JSON.stringify(value);
  }

  if (column.render) {
    const result = column.render({ row: item, index, data, cell: value });
    if (
      React.isValidElement(result) ||
      typeof result === "string" ||
      typeof result === "number"
    )
      return result;
    return <span className="text-destructive">Invalid Render</span>;
  }

  if (value === null || value === undefined)
    return <span className="text-muted-foreground">N/A</span>;

  switch (column.type) {
    // case "date":
    //   return formatDate(value);
    // case "number":
    //   return formatNumber(value);
    case "currency":
      return currencyFormatter(value, column.currency, column.format);
    default:
      return value;
  }
};

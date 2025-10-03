"use client";
import SimpleDropdown from "../dropdown/SimpleDropdown";

type SortOption = {
  label: string;
  value: [string, "asc" | "desc"];
};

const sortOptions: SortOption[] = [
  //   { label: "Best Match", value: ["relevance", "desc"] },
  { label: "Latest", value: ["created_at", "desc"] },
  { label: "Price: Low to High", value: ["price", "asc"] },
  { label: "Price: High to Low", value: ["price", "desc"] },
];

interface SortDropdownProps {
  addQuery?: (key: string, value: string) => void;
  onChange?: (sort: [string, "asc" | "desc"]) => void;
}

export function SortDropdown({ addQuery }: SortDropdownProps) {
  const onChange = (sort: [string, "asc" | "desc"]) => {
    if (addQuery) addQuery("sort", JSON.stringify(sort));
  };
  return (
    <>
      <SimpleDropdown
        title="Sort by"
        options={sortOptions}
        defaultValue={sortOptions[0].value}
        onChange={onChange}
      />
    </>
  );
}

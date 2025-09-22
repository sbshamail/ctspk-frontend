"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// import { capitalize } from "@/utils/helpers";

// ---- Types ----
type OptionObject = { value: string | number; title: string };
type Option = string | OptionObject;

interface FilterableSelectProps {
  errorMessage?: string;
  label?: string;
  labelPosition?: "top" | "inside";
  placeholder?: string;
  className?: string;
  options: (string | OptionObject)[];
  filterEnabled?: boolean;
  listClass?: string;
  disable?: boolean;
  value?: string | number;
  setvalue?: React.Dispatch<
    React.SetStateAction<string | number | undefined | any>
  >;
  onChange?: (item: OptionObject | "") => void;
  keyTitle?: keyof OptionObject;
  keyValue?: keyof OptionObject;
  align?: "center" | "start" | "end";
}

// ---- Component ----
export function FilterableSelect<T extends Option>({
  errorMessage,
  label,
  labelPosition = "top",
  placeholder,
  className = "",
  options,
  filterEnabled = true,
  listClass,
  disable,
  value,
  setvalue,
  onChange,
  keyTitle = "title",
  keyValue = "value",
  align = "center",
}: FilterableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const commandListRef = React.useRef<HTMLDivElement>(null);

  // Normalize options to object form
  const normalizedOptions: OptionObject[] = React.useMemo(() => {
    return options.map((opt) =>
      typeof opt === "string" ? { value: opt, title: opt } : opt
    );
  }, [options]);

  const selectedItem = normalizedOptions.find(
    (item) => item[keyValue] === value
  );
  const selectedValueTitle =
    selectedItem?.[keyTitle as keyof OptionObject]?.toString()?.toLowerCase() ??
    "";

  // Filtering
  const filteredOptions = React.useMemo(() => {
    if (!filterEnabled || !searchValue.trim()) return normalizedOptions;

    const searchTerm = searchValue.toLowerCase().trim();
    return normalizedOptions.filter((item) =>
      item[keyTitle as keyof OptionObject]
        ?.toString()
        .toLowerCase()
        .includes(searchTerm)
    );
  }, [normalizedOptions, searchValue, filterEnabled, keyTitle]);

  // Reset search when popover closes
  React.useEffect(() => {
    if (!open) setSearchValue("");
  }, [open]);

  // Scroll to top when search changes
  React.useEffect(() => {
    if (commandListRef.current) commandListRef.current.scrollTop = 0;
  }, [searchValue, filteredOptions]);

  const handleSelect = (selectedValue: string | number) => {
    if (disable) return;
    const selected = normalizedOptions.find(
      (item) => item[keyValue as keyof OptionObject] === selectedValue
    );
    if (setvalue) setvalue(selected?.[keyValue as keyof OptionObject]);
    if (onChange) onChange(selected ?? "");
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setvalue?.(undefined);
    onChange?.("");
    setOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      {label && labelPosition !== "inside" && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            role="combobox"
            aria-expanded={open}
            disabled={disable}
            className={cn(
              "w-full flex justify-between items-center p-3 py-5 rounded-lg",
              !value && "text-muted-foreground",
              labelPosition === "inside" && "py-6 pt-7",
              className
            )}
          >
            <div className="flex-1 text-left truncate capitalize">
              {label && labelPosition === "inside" && (
                <label className="absolute top-0 text-[10px] text-muted-foreground mb-0.5">
                  {label}
                </label>
              )}
              <span className="capitalize">
                {selectedValueTitle || placeholder || label || "Select"}
              </span>
            </div>

            <div className="flex items-center gap-1 ml-2">
              {value && !disable && (
                <div
                  onClick={handleClear}
                  className="hover:bg-muted rounded p-1"
                >
                  <X className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-foreground" />
                </div>
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align={align}
          className={cn("p-0 w-[--radix-popover-trigger-width]", listClass)}
        >
          <Command shouldFilter={false} className="bg-secondary">
            {filterEnabled && (
              <CommandInput
                placeholder={`Search ${label?.toLowerCase() || "options"}...`}
                className="h-9"
                value={searchValue}
                onValueChange={setSearchValue}
              />
            )}
            <CommandList ref={commandListRef} className="overflow-auto">
              {filteredOptions.length === 0 ? (
                <CommandEmpty>No results found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredOptions.map((item) => (
                    <CommandItem
                      key={item[keyValue as keyof OptionObject]?.toString()}
                      value={item[keyValue as keyof OptionObject]?.toString()}
                      onSelect={() =>
                        handleSelect(item[keyValue as keyof OptionObject]!)
                      }
                      className="cursor-pointer"
                    >
                      <span className="capitalize flex-1">
                        {item[keyTitle as keyof OptionObject]}
                      </span>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          item[keyValue as keyof OptionObject] === value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {errorMessage && (
        <span className="text-xs text-red-500 mt-1 block">{errorMessage}</span>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { FilterableSelect } from "@/components/select/FilterableSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClassNameType } from "@/utils/reactTypes";
interface MainSearchbarProps {
  className?: ClassNameType;
}
const MainSearchbar = ({ className }: MainSearchbarProps) => {
  const [category, setCategory] = useState<string>("all-categories");
  const categories = [
    "Milks and Dairies",
    "Wines & Alcohol",
    "Clothing & Beauty",
    "Pet Foods & Toy",
    "Fast food",
    "Baking material",
    "Vegetables",
    "Fresh Seafood",
    "Noodles & Rice",
    "Ice cream",
  ];
  return (
    <div className={cn("hidden lg:flex flex-1 max-w-2xl ", className)}>
      <div className="flex w-full border border-border rounded-md">
        <FilterableSelect
          options={categories}
          setvalue={setCategory}
          placeholder="Select category"
          value={category}
          className="border-none rounded-none"
          // onChange={(item) => setCategory(item.value)}
        />

        <div className="relative flex-1">
          <Input
            placeholder="Search for items..."
            className="border-none rounded-none pr-12 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button size="sm" className="absolute right-1 top-1 h-8">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MainSearchbar;

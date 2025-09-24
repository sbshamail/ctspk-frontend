import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ClassNameType } from "@/utils/reactTypes";
import { Mic, Search } from "lucide-react";
import { useState } from "react";
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
        {/* <FilterableSelect
          options={categories}
          setvalue={setCategory}
          placeholder="Select category"
          value={category}
          className="border-none rounded-none"
        /> */}

        <div className="relative flex-1">
          <Input
            placeholder="Search for items..."
            className="border-none rounded-none pr-12 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <div className="flex gap-1 absolute right-1 top-1 h-8">
            <Button size="sm" variant={"ghost"}>
              <Mic className="h-2 w-2" />
            </Button>
            <Separator orientation="vertical" />
            <Button size="sm" variant={"ghost"}>
              <Search className="h-2 w-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainSearchbar;

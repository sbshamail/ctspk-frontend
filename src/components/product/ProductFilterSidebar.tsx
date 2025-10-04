"use client";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import CategoryFilter from "./CategoryFilter";
import PriceFilter from "./PriceFilter";
import RatingFilter from "./RatingFilter";

interface ProductFilterSidebarType {
  categoriesList: string[];
  addQuery: (key: string, value: string) => void;
  deleteQueryAll: () => void;
}

const ProductFilterSidebar = ({
  categoriesList = [],
  addQuery,
  deleteQueryAll,
}: ProductFilterSidebarType) => {
  const [categories, setCategories] = useState<any>(categoriesList);
  const [lowPrice, setLowPrice] = useState(0);
  const [highPrice, setHighPrice] = useState(1000);

  const handleCategories = (isChecked: boolean, item: any) => {
    setCategories((prev: any) => {
      if (isChecked) {
        // add if not already there
        if (!prev.some((cat: any) => cat.id === item.id)) {
          return [...prev, { id: item.id, name: item.name }];
        }
        return prev;
      } else {
        return prev.filter((cat: any) => cat.id !== item.id);
      }
    });
  };

  console.log(categories);
  const applyFilter = () => {
    if (categories.length > 0) {
      const columnFilters = categories.map((cat: any) => [
        "category.root_id",
        Number(cat.id),
      ]);
      addQuery("columnFilters", JSON.stringify(columnFilters));
    }
    if (lowPrice !== 0 || highPrice !== 1000) {
      // ✅ backend expects ["amount", min, max]
      addQuery("numberRange", JSON.stringify(["price", lowPrice, highPrice]));
    }
  };

  const clearFilter = () => {
    setCategories([]);
    setLowPrice(0);
    setHighPrice(1000);
    deleteQueryAll();
  };

  return (
    <div className="w-full flex flex-col item-center space-y-6">
      <div className="w-full flex items-end justify-end space-x-2">
        <Button variant="secondary" onClick={clearFilter}>
          Clear Filter
        </Button>
        <Button onClick={applyFilter}>Apply</Button>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["price", "category", "rating"]}
        className="w-full"
      >
        <AccordionItem value="price">
          <AccordionTrigger>Price</AccordionTrigger>
          <AccordionContent>
            <PriceFilter
              lowPrice={lowPrice}
              highPrice={highPrice}
              setLowPrice={setLowPrice}
              setHighPrice={setHighPrice}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="category">
          <AccordionTrigger>Category</AccordionTrigger>
          <AccordionContent>
            <CategoryFilter
              handleCategories={handleCategories}
              checkedCategories={categories}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rating">
          <AccordionTrigger>Rating</AccordionTrigger>
          <AccordionContent>
            <RatingFilter />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ProductFilterSidebar;

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
  addQuery: any;
  deleteQueryAll: () => void;
}
const ProductFilterSidebar = ({
  categoriesList = [],
  addQuery,
  deleteQueryAll,
}: ProductFilterSidebarType) => {
  const [categories, setCategories] = useState<string[]>(categoriesList);

  const handleCategories = (isChecked: boolean, item: string) => {
    setCategories((prevCategories) => {
      if (isChecked) {
        return [...prevCategories, item];
      } else {
        return prevCategories.filter((cat) => cat !== item);
      }
    });
  };

  const applyFilter = () => {
    addQuery("categories", categories.join(","));
  };
  const clearFilter = () => {
    setCategories([]);
    deleteQueryAll();
  };
  return (
    <div className=" w-full flex flex-col item-center space-y-6">
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
            <PriceFilter />
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

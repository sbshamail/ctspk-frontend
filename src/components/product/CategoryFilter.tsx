"use client";

import { useGetCategoriesQuery } from "@/store/services/categoryApi";
import { ChevronRight } from "lucide-react";
import LayoutSkeleton from "../loaders/LayoutSkeleton";
import { Checkbox } from "../ui/checkbox";

interface Props {
  handleCategories: (e: boolean, item: string) => void;
  checkedCategories: string[];
}

const CategoryFilter = ({ handleCategories, checkedCategories }: Props) => {
  const { data, isLoading, isError } = useGetCategoriesQuery();

  const categoriesList = data?.data ?? [];
  isLoading && <LayoutSkeleton />;
  return (
    <div>
      {categoriesList.map((item: any, index: number) => (
        <div key={index}>
          <div className="flex justify-between">
            <table className="m-0 p-0 w-full border-collapse">
              <thead className="border-none">
                <tr>
                  <th className="text-left"></th>
                  <th className="text-left"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="w-10 whitespace-normal m-0 p-0 text-left">
                    <Checkbox
                      checked={checkedCategories.includes(item.name)}
                      onCheckedChange={(checked) =>
                        handleCategories(!!checked, item.name!)
                      }
                    />
                  </td>
                  <td className="m-0 p-0  text-left whitespace-normal">
                    <h5 className="text-lg ">{item.name}</h5>
                  </td>
                </tr>
              </tbody>
            </table>
            <ChevronRight />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryFilter;

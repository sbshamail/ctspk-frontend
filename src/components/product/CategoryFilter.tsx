import { useGetCategoriesQuery } from "@/store/services/categoryApi";
import { ChevronRight } from "lucide-react";
import LayoutSkeleton from "../loaders/LayoutSkeleton";
import { Checkbox } from "../ui/checkbox";

interface Props {
  handleCategories: (checked: boolean, item: any) => void;
  checkedCategories: { id: number; name: string }[];
}

const CategoryFilter = ({ handleCategories, checkedCategories }: Props) => {
  const { data, isLoading } = useGetCategoriesQuery();
  const categoriesList = data?.data ?? [];

  if (isLoading) return <LayoutSkeleton />;

  return (
    <div>
      {categoriesList.map((item: any) => {
        const isChecked = checkedCategories.some((c) => c.id === item.id);
        return (
          <div key={item.id} className="flex justify-between">
            <table className="m-0 p-0 w-full border-collapse">
              <tbody>
                <tr>
                  <td className="w-10 text-left">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleCategories(!!checked, item)
                      }
                    />
                  </td>
                  <td className="m-0 p-0 text-left">
                    <h5 className="text-lg">{item.name}</h5>
                  </td>
                </tr>
              </tbody>
            </table>
            <ChevronRight />
          </div>
        );
      })}
    </div>
  );
};

export default CategoryFilter;

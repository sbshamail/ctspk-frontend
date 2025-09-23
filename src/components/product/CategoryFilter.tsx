"use client";

import { CategoryDataType } from "@/utils/modelTypes";
import { ChevronRight } from "lucide-react";
import { Checkbox } from "../ui/checkbox";

interface Props {
  handleCategories: (e: boolean, item: string) => void;
  checkedCategories: string[];
}

export const categoriesList: CategoryDataType[] = [
  {
    id: 1,
    name: "Clothes",
    image: "https://i.imgur.com/QkIa5tT.jpeg",
    creationAt: "2024-07-21T03:45:06.000Z",
    updatedAt: "2024-07-21T03:45:06.000Z",
    children: [
      {
        id: 10,
        name: "Men",
        children: [
          {
            id: 11,
            name: "T Shirt Half Sleeve",
          },
          {
            id: 12,
            name: "T Shirt Full Sleeve",
          },
        ],
      },
      {
        id: 13,
        name: "Women",
        children: [
          {
            id: 14,
            name: "T Shirt Half Sleeve",
          },
          {
            id: 15,
            name: "T Shirt Full Sleeve",
          },
        ],
      },
      {
        id: 13,
        name: "Unisex",
        children: [
          {
            id: 14,
            name: "T Shirt Half Sleeve",
          },
          {
            id: 15,
            name: "T Shirt Full Sleeve",
          },
        ],
      },
      {
        id: 16,
        name: "Xyz",
        children: [
          {
            id: 14,
            name: "T Shirt Half Sleeve",
          },
          {
            id: 15,
            name: "T Shirt Full Sleeve",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Electronics",

    image: "https://i.imgur.com/ZANVnHE.jpeg",
    creationAt: "2024-07-21T03:45:06.000Z",
    updatedAt: "2024-07-21T03:45:06.000Z",
  },
  {
    id: 3,
    name: "Furniture",
    image: "https://i.imgur.com/Qphac99.jpeg",
    creationAt: "2024-07-21T03:45:06.000Z",
    updatedAt: "2024-07-21T03:45:06.000Z",
  },
  {
    id: 4,
    name: "Shoes",
    image: "https://i.imgur.com/qNOjJje.jpeg",
    creationAt: "2024-07-21T03:45:06.000Z",
    updatedAt: "2024-07-21T03:45:06.000Z",
  },
  {
    id: 5,
    name: "Miscellaneous",
    image: "https://i.imgur.com/BG8J0Fj.jpg",
    creationAt: "2024-07-21T03:45:06.000Z",
    updatedAt: "2024-07-21T03:45:06.000Z",
  },
  {
    id: 6,
    name: "Starbucks",
    image: "https://www.logogenie.net/images/articles/starbucks-logo1.jpg",
    creationAt: "2024-07-21T07:30:38.000Z",
    updatedAt: "2024-07-21T07:30:38.000Z",
  },
  {
    id: 7,
    name: "Adidas",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/2560px-Adidas_Logo.svg.png",
    creationAt: "2024-07-21T07:34:50.000Z",
    updatedAt: "2024-07-21T07:34:50.000Z",
  },

  {
    id: 8,
    name: "fantasy",
    image: "https://api.escuelajs.co/api/v1/files/b610b.jpg",
    creationAt: "2024-07-22T00:01:02.000Z",
    updatedAt: "2024-07-22T00:01:02.000Z",
  },
  {
    id: 9,
    name: "zamalak",
    image: "https://api.escuelajs.co/api/v1/files/47d7.jpg",
    creationAt: "2024-07-22T00:02:39.000Z",
    updatedAt: "2024-07-22T00:02:39.000Z",
  },
];
const CategoryFilter = ({ handleCategories, checkedCategories }: Props) => {
  return (
    <div>
      {categoriesList.map((item, index) => (
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

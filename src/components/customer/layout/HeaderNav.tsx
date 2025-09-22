"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Grid3X3, LayoutGrid, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import MainSearchbar from "../searchbar/MainSearchbar";

const categories = [
  {
    title: "Milks and Dairies",
    image: "/assets/imgs/theme/icons/category-1.svg",
  },
  {
    title: "Clothing & Beauty",
    image: "/assets/imgs/theme/icons/category-2.svg",
  },
  {
    title: "Pet Foods & Toys",
    image: "/assets/imgs/theme/icons/category-3.svg",
  },
  {
    title: "Baking Material",
    image: "/assets/imgs/theme/icons/category-4.svg",
  },
  { title: "Fresh Fruit", image: "/assets/imgs/theme/icons/category-5.svg" },
  { title: "Wines & Drinks", image: "/assets/imgs/theme/icons/category-6.svg" },
  { title: "Fresh Seafood", image: "/assets/imgs/theme/icons/category-7.svg" },
  { title: "Fast Food", image: "/assets/imgs/theme/icons/category-8.svg" },
  { title: "Vegetables", image: "/assets/imgs/theme/icons/category-9.svg" },
  {
    title: "Bread and Juice",
    image: "/assets/imgs/theme/icons/category-10.svg",
  },
];

const navigationItems = ["Home", "Shop", "About", "Contact"];

export default function HeaderNav({ y }: any) {
  return (
    <div className="hidden lg:block  rounded ">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Browse Categories */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size={"lg"}
                className="flex items-center gap-2 rounded 
                  "
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="font-medium text-base">
                  Browse All Categories
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              className="w-[500px] p-4 bg-card text-card-foreground border rounded-lg shadow-lg"
            >
              {/* Categories grid */}
              <div className="grid grid-cols-2 gap-8">
                {categories.map((cat) => (
                  <CategoryItem
                    key={cat.title}
                    title={cat.title}
                    image={cat.image}
                  />
                ))}
              </div>

              {/* Footer */}
              <div className="border-t mt-4 pt-4">
                <button
                  className="flex items-center gap-2 text-sm font-medium 
        text-primary hover:text-primary/80 transition-colors"
                >
                  <div className="w-6 h-6 border-2 border-primary rounded-full flex items-center justify-center">
                    <Minus className="h-3 w-3" />
                  </div>
                  <span>Show more...</span>
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Search Bar */}
          <div
            className={cn(" max-w-2xl flex flex-1", y > 0 ? "block" : "hidden")}
          >
            <MainSearchbar />
          </div>
          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item}
                href="#"
                className={cn(
                  " hover:text-primary transition-colors font-medium"
                )}
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

function CategoryItem({
  title,
  image,
}: {
  title: string;
  image?: string | null;
}) {
  return (
    <div className="flex items-center gap-3 text-foreground hover:text-primary cursor-pointer">
      {image ? (
        <Image src={image} alt={title} width={24} height={24} />
      ) : (
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-primary rounded" />
        </div>
      )}
      <span className="text-sm font-medium">{title}</span>
    </div>
  );
}

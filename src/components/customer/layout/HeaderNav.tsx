"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Grid3X3, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

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

export default function HeaderNav() {
  return (
    <div className="hidden lg:block bg-muted rounded ">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Browse Categories */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-4 py-2 rounded-md 
                  hover:bg-primary/10 transition-colors"
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="font-medium">Browse All Categories</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              className="w-80 p-0 bg-card text-card-foreground border rounded-lg shadow-lg"
            >
              <div className="grid grid-cols-2 divide-x divide-border">
                {/* Left column */}
                <div className="p-4 space-y-3">
                  {categories.slice(0, 5).map((cat) => (
                    <CategoryItem
                      key={cat.title}
                      title={cat.title}
                      image={cat.image}
                    />
                  ))}
                </div>
                {/* Right column */}
                <div className="p-4 space-y-3">
                  {categories.slice(5, 10).map((cat) => (
                    <CategoryItem
                      key={cat.title}
                      title={cat.title}
                      image={cat.image}
                    />
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t p-4">
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

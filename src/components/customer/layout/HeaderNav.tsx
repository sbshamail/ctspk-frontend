"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Screen } from "@/@core/layout";
import HeartIcon from "@/components/icons/HeartIcon";
import ShoppingCartIcon from "@/components/icons/ShoppingCartIcon";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetCategoriesQuery } from "@/store/services/categoryApi";
import { CategoryDataType } from "@/utils/modelTypes";
import Link from "next/link";

interface HeaderNavProps {
  y: number;
}
export function HeaderNav({ y }: HeaderNavProps) {
  const { data, isLoading, isError } = useGetCategoriesQuery();

  const categories: CategoryDataType[] = data?.data ?? [];

  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(
    null
  );
  const [visibleCategories, setVisibleCategories] = useState<number>(
    categories.length
  );
  const navRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const calculateVisibleCategories = () => {
  //     if (navRef.current && categoriesRef.current) {
  //       const containerWidth = navRef.current.offsetWidth;
  //       const iconsWidth = 120; // reserve space for icons
  //       const moreButtonWidth = 90; // reserve space for "MORE" button
  //       const availableWidth = containerWidth - iconsWidth - moreButtonWidth;

  //       let totalWidth = 0;
  //       let maxVisible = 0;

  //       // get all rendered buttons inside categoriesRef
  //       const buttons = categoriesRef.current.querySelectorAll("button");

  //       for (let i = 0; i < buttons.length; i++) {
  //         const btnWidth = (buttons[i] as HTMLButtonElement).offsetWidth + 8; // include spacing
  //         if (totalWidth + btnWidth <= availableWidth) {
  //           totalWidth += btnWidth;
  //           maxVisible++;
  //         } else {
  //           break;
  //         }
  //       }

  //       setVisibleCategories(Math.max(1, maxVisible)); // at least 1 always visible
  //     }
  //   };

  //   calculateVisibleCategories();
  //   window.addEventListener("resize", calculateVisibleCategories);
  //   return () =>
  //     window.removeEventListener("resize", calculateVisibleCategories);
  // }, [categories]);
  useEffect(() => {
    const calculateVisibleCategories = () => {
      if (!navRef.current || categories.length === 0) return;

      const containerWidth = navRef.current.offsetWidth;
      const iconsWidth = 120; // right icons
      let availableWidth = containerWidth - iconsWidth;

      // Measure widths of ALL categories (even those that might go into More)
      const buttonWidths = Array.from(
        categoriesRef.current?.querySelectorAll("button") ?? []
      ).map((btn) => (btn as HTMLButtonElement).offsetWidth + 8);

      let totalWidth = 0;
      let maxVisible = categories.length;

      for (let i = 0; i < buttonWidths.length; i++) {
        if (totalWidth + buttonWidths[i] <= availableWidth) {
          totalWidth += buttonWidths[i];
        } else {
          maxVisible = i; // stop here
          break;
        }
      }

      // If not all categories fit, reserve space for "More" button and recalc
      if (maxVisible < categories.length) {
        availableWidth = containerWidth - iconsWidth - 90; // subtract More btn
        totalWidth = 0;
        maxVisible = 0;
        for (let i = 0; i < buttonWidths.length; i++) {
          if (totalWidth + buttonWidths[i] <= availableWidth) {
            totalWidth += buttonWidths[i];
            maxVisible++;
          } else {
            break;
          }
        }
      }

      setVisibleCategories(Math.max(1, maxVisible));
    };

    calculateVisibleCategories();
    window.addEventListener("resize", calculateVisibleCategories);
    return () =>
      window.removeEventListener("resize", calculateVisibleCategories);
  }, [categories]);

  const handleCategoryHover = (category: CategoryDataType) => {
    setActiveSubCategory(null);
    if (!category?.children || category?.children?.length === 0) {
      return setActiveCategory(null);
    }
    setActiveCategory(category.name);
  };

  const handleSubCategoryHover = (subCategoryName: string) => {
    setActiveSubCategory(subCategoryName);
  };

  const handleMouseLeave = () => {
    setActiveCategory(null);
    setActiveSubCategory(null);
  };

  const getActiveCategory = () => {
    return categories.find((cat) => cat.name === activeCategory);
  };

  const getActiveSubCategory = () => {
    const category = getActiveCategory();
    if (!category?.children) return null;
    return category.children.find((sub) => sub.name === activeSubCategory);
  };

  const mainCategories = categories.slice(0, visibleCategories);
  const overflowCategories = categories.slice(visibleCategories);

  if (isError) {
    return null;
  }
  if (isLoading) {
    return <LayoutSkeleton header={true} />;
  }
  return (
    <div className="relative" onMouseLeave={handleMouseLeave}>
      {/* Main Navigation Bar */}

      <Screen>
        <nav className="w-full bg-background">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="flex items-center justify-between h-16"
              ref={navRef}
            >
              {/* Main Categories */}
              <div
                className="flex items-center space-x-1 flex-1 overflow-hidden pr-4"
                ref={categoriesRef}
              >
                {mainCategories.map((category) => (
                  <button
                    key={category.name}
                    className={cn(
                      "flex items-center space-x-1 px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-md whitespace-nowrap",
                      activeCategory === category.name
                        ? "text-primary bg-accent"
                        : "text-foreground hover:text-primary hover:bg-accent/50"
                    )}
                    onMouseEnter={() => handleCategoryHover(category)}
                  >
                    <span className="truncate">
                      {category.name.toUpperCase()}
                    </span>
                    {category.children && <ChevronDown className="w-4 h-4" />}
                  </button>
                ))}
              </div>

              {/* Right Side: More Button + Icons */}
              <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                {overflowCategories.length > 0 && (
                  <DropdownMenu open={open} onOpenChange={setOpen}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-colors duration-200 border border-border"
                        onMouseEnter={() => setOpen(true)}
                        onMouseLeave={() => setOpen(false)}
                      >
                        <span>MORE</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      onMouseEnter={() => setOpen(true)}
                      onMouseLeave={() => setOpen(false)}
                    >
                      {overflowCategories.map((category, index) => (
                        <div key={category.name}>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onMouseEnter={() => handleCategoryHover(category)}
                          >
                            <span className="font-medium">{category.name}</span>
                            {category.children && (
                              <ChevronRight className="w-4 h-4 ml-auto" />
                            )}
                          </DropdownMenuItem>
                          {index < overflowCategories.length - 1 && (
                            <DropdownMenuSeparator />
                          )}
                        </div>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Navigation Icons */}
                <div className="flex items-center space-x-2 border-l border-border pl-4">
                  <Link
                    href="/wishlist"
                    className="p-2 hover:bg-accent/50 rounded-md transition-colors"
                  >
                    <HeartIcon />
                  </Link>
                  <Link
                    href="/cart"
                    className="p-2 hover:bg-accent/50 rounded-md transition-colors"
                  >
                    <ShoppingCartIcon />
                  </Link>
                  {y > 0 && <Search className="w-4 h-4" />}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </Screen>
      {activeCategory && (
        <div className="absolute top-full left-0 w-full z-50 shadow-lg border-b border-border bg-popover">
          <Screen>
            <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-12 gap-8">
                {/* Level 2 Categories */}
                <div className="col-span-3">
                  <h3 className="text-lg font-semibold text-popover-foreground mb-4">
                    Shop by Category
                  </h3>
                  <div className="space-y-1">
                    {getActiveCategory()?.children?.map((subCategory) => (
                      <button
                        key={subCategory.name}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 text-left text-sm transition-colors duration-200 rounded-md",
                          activeSubCategory === subCategory.name
                            ? "text-primary bg-accent"
                            : "text-popover-foreground hover:text-primary hover:bg-accent/50"
                        )}
                        onMouseEnter={() =>
                          handleSubCategoryHover(subCategory.name)
                        }
                      >
                        <span>{subCategory.name}</span>
                        {subCategory.children && (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level 3 Categories */}
                {getActiveSubCategory()?.children && (
                  <div className="col-span-3">
                    <h3 className="text-lg font-semibold text-popover-foreground mb-4">
                      {getActiveSubCategory()?.name}
                    </h3>
                    <div className="space-y-1">
                      {getActiveSubCategory()?.children?.map((item) => (
                        <Link
                          key={item.name}
                          href={{
                            pathname: "/product",
                            query: { searchTerm: item.name },
                          }}
                          className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-colors duration-200"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collections Section */}
                <div className="col-span-3">
                  <h3 className="text-lg font-semibold text-popover-foreground mb-4">
                    Collections
                  </h3>
                  <div className="space-y-1">
                    {[
                      "New Arrivals",
                      "Best Sellers",
                      "Trending Now",
                      "Limited Edition",
                      "Seasonal Picks",
                    ].map((collection) => (
                      <Link
                        key={collection}
                        href="#"
                        className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-colors"
                      >
                        {collection}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Promotional Banner */}
                <div className="col-span-3">
                  <div className="bg-gradient-to-br from-primary/10 to-accent rounded-lg p-6 h-full flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl">🎉</span>
                    </div>
                    <h4 className="text-lg font-semibold text-popover-foreground mb-2">
                      Up to 50% Off
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {activeCategory === "Fashion & Apparel"
                        ? "Summer Styles"
                        : activeCategory === "Electronics & Appliances"
                        ? "Tech Deals"
                        : "Special Offers"}
                    </p>
                    <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Screen>
        </div>
      )}
    </div>
  );
}

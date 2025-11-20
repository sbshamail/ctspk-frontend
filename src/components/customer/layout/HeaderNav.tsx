"use client";

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
import { cn } from "@/lib/utils";
import { useGetCategoriesQuery } from "@/store/services/categoryApi";
import { useGetBrandsQuery } from "@/store/services/brandApi";
import { CategoryDataType } from "@/utils/modelTypes";
import { ChevronDown, ChevronRight, Search, Mic, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/context/cartContext";
import { MainLogo } from "@/components/logo/MainLogo";
import { useRouter } from "next/navigation";

interface HeaderNavProps {
  y: number;
}

export function HeaderNav({ y }: HeaderNavProps) {
  const { data: categoriesData, isLoading: categoriesLoading, isError: categoriesError } = useGetCategoriesQuery();
  const { data: brandsData, isLoading: brandsLoading, isError: brandsError } = useGetBrandsQuery(undefined, {
    skip: typeof window === 'undefined',
  });
  const { cart } = useCart();
  const router = useRouter();

  const categories: CategoryDataType[] = categoriesData?.data ?? [];
  const brands = brandsData?.data ?? [];

  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [visibleCategories, setVisibleCategories] = useState<number>(categories.length);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Calculate cart count
  const cartCount = cart?.length || 0;
  const wishlistCount = 0; // TODO: Implement wishlist count

  // Handle search submission
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/product?searchTerm=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSearch(false);
    }
  };

  // Calculate visible categories only after component mounts and categories are loaded
  useEffect(() => {
    if (categories.length === 0) return;

    const calculateVisibleCategories = () => {
      if (!navRef.current) return;

      const containerWidth = navRef.current.offsetWidth;
      const iconsWidth = 120;
      let availableWidth = containerWidth - iconsWidth;

      const buttonWidths = Array.from(
        categoriesRef.current?.querySelectorAll("button") ?? []
      ).map((btn) => (btn as HTMLButtonElement).offsetWidth + 8);

      let totalWidth = 0;
      let maxVisible = categories.length;

      for (let i = 0; i < buttonWidths.length; i++) {
        if (totalWidth + buttonWidths[i] <= availableWidth) {
          totalWidth += buttonWidths[i];
        } else {
          maxVisible = i;
          break;
        }
      }

      if (maxVisible < categories.length) {
        availableWidth = containerWidth - iconsWidth - 90;
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

    requestAnimationFrame(() => {
      calculateVisibleCategories();
    });

    const handleResize = () => {
      requestAnimationFrame(calculateVisibleCategories);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  // Handle level 2 subcategory click - use same URL format as level 3
  const handleSubCategoryClick = (subCategory: CategoryDataType) => {
    if (subCategory.id) {
      // Use category.id filter with level=2 to distinguish from level 3
      const filterParam = `columnFilters=%5B%5B"category.id"%2C${subCategory.id}%5D%5D&level=2`;
      router.push(`/product?${filterParam}`);
    }
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

  // Function to generate brand URL with correct encoding
  const getBrandUrl = (brandId: number) => {
    const filterParam = `columnFilters=%5B%5B"manufacturer_id"%2C${brandId}%5D%5D`;
    return `/product?${filterParam}`;
  };

  // Function to generate category URL for level 3 items (use category.id)
  const getLevel3CategoryUrl = (categoryId: number) => {
    const filterParam = `columnFilters=%5B%5B"category.id"%2C${categoryId}%5D%5D`;
    return `/product?${filterParam}`;
  };

  // Function to generate category URL for level 1 (use category.root_id)
  const getLevel1CategoryUrl = (rootId: number) => {
    const filterParam = `columnFilters=%5B%5B"category.root_id"%2C${rootId}%5D%5D`;
    return `/product?${filterParam}`;
  };

  // Handle level 1 category click
  const handleCategoryClick = (category: CategoryDataType) => {
    if (category.root_id) {
      router.push(getLevel1CategoryUrl(category.root_id));
    }
  };

  const mainCategories = categories.slice(0, visibleCategories);
  const overflowCategories = categories.slice(visibleCategories);

  if (categoriesLoading || (brandsLoading && brands.length === 0)) {
    return <LayoutSkeleton header={true} />;
  }

  if (categoriesError) {
    return null;
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
              {/* Left Side: Logo (only visible when scrolled) and Search Icon */}
              {y > 100 && (
                <div className="flex items-center space-x-4">
                  <MainLogo />
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className="p-2 hover:bg-accent/50 rounded-md transition-colors"
                    aria-label="Search"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Menu Items - Reordered: Brands, Categories, New Arrival, Sales, Limited Edition */}
              <div className="flex items-center space-x-1 flex-1 overflow-hidden px-4">
                {/* Brands Dropdown - FIRST */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-colors duration-200 whitespace-nowrap">
                      <span>BRANDS</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="max-h-96 overflow-y-auto">
                    {brands.map((brand) => (
                      <DropdownMenuItem key={brand.id} asChild>
                        <Link
                          href={getBrandUrl(brand.id)}
                          className="cursor-pointer w-full"
                        >
                          {brand.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    {brandsError && (
                      <DropdownMenuItem disabled>
                        Failed to load brands
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Categories - SECOND */}
                <div
                  className="flex items-center space-x-1 flex-1 overflow-hidden"
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
                      onClick={() => handleCategoryClick(category)}
                    >
                      <span className="truncate">
                        {category.name.toUpperCase()}
                      </span>
                      {category.children && <ChevronDown className="w-4 h-4" />}
                    </button>
                  ))}

                  {/* More Categories Dropdown */}
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
                              onClick={() => handleCategoryClick(category)}
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
                </div>

                {/* Additional Menu Items - New Arrival, Sales, Limited Edition */}
                <Link
                  href="/new-arrivals"
                  className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-colors duration-200 whitespace-nowrap"
                >
                  NEW ARRIVAL
                </Link>
                <Link
                  href="/sales"
                  className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-colors duration-200 whitespace-nowrap"
                >
                  SALES
                </Link>
                <Link
                  href="/limited-edition"
                  className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-colors duration-200 whitespace-nowrap"
                >
                  LIMITED EDITION
                </Link>
              </div>

              {/* Right Side: Wishlist and Cart Icons with Badges */}
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
              </div>
            </div>

            {/* Sticky Search Bar (appears when scrolled and search icon is clicked) */}
            {y > 100 && showSearch && (
              <div className="pb-4 pt-2 animate-in slide-in-from-top duration-300">
                <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full pl-10 pr-20 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="absolute right-12 p-1 hover:bg-accent/50 rounded-md transition-colors"
                      aria-label="Voice search"
                    >
                      <Mic className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSearch(false);
                        setSearchQuery("");
                      }}
                      className="absolute right-2 p-1 hover:bg-accent/50 rounded-md transition-colors"
                      aria-label="Close search"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </nav>
      </Screen>

      {/* Mega Menu Dropdown */}
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
                        onClick={() => handleSubCategoryClick(subCategory)}
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
                          href={item.id ? getLevel3CategoryUrl(item.id) : '#'}
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
                      ["New Arrivals", "/new-arrivals"],
                      ["Best Sellers", "/best-sellers"],
                      ["Trending Now", "/trending-now"],
                      ["Limited Edition", "/limited-edition"],
                      ["Sales", "/sales"],
                    ].map(([collection, href]) => (
                      <Link
                        key={collection}
                        href={href}
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
                      Deals & Discount
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {activeCategory === "Fashion & Apparel"
                        ? "Summer Styles"
                        : activeCategory === "Electronics & Appliances"
                        ? "Tech Deals"
                        : "Special Offers"}
                    </p>
                    <Link href="/sales">
                     <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
                      Shop Now
                     </button>
                    </Link>
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
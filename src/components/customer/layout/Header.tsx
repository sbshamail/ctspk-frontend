"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Menu, Search, ShoppingCart, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useWindowScroll } from "react-use";
import Topbar from "./Topbar";
import Image from "next/image";
import { Screen } from "@/@core/layout";

import { SimpleFilterableSelect } from "@/components/select/SearchSelect";
import HeaderNav from "./HeaderNav";
import Link from "next/link";
import { cn } from "@/lib/utils";

const Header = () => {
  const { y } = useWindowScroll();
  const [category, setCategory] = useState<string>("all-categories");

  const navigationItems = [
    { name: "Home", href: "/", active: true },
    { name: "Shop", href: "/shop" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
    { name: "About Us", href: "/about" },
  ];
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
    <>
      <header className="bg-background text-foreground sticky top-0 z-50 transition-all duration-300 ">
        <Screen>
          {/* Top Bar */}
          <div
            className={`w-full transition-all duration-300 ${
              y > 0
                ? "w-10 -translate-y-24 opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
            <Topbar />
          </div>

          {/* Main Header */}
          <div
            className={`transition-all duration-300 ${
              y > 0 ? "-mt-14" : "mt-0"
            } py-4`}
          >
            <div className="w-full   sm:px-6 ">
              <div className=" flex items-center justify-between">
                {/* Logo */}
                <div className="w-20">
                  <Link href="/">
                    <Image
                      alt="logo"
                      src="/assets/imgs/theme/logo.svg"
                      height={100}
                      width={100}
                    />
                  </Link>
                </div>

                {/* Search Bar */}
                <div className="hidden lg:flex flex-1 max-w-2xl ">
                  <div className="flex w-full border border-border rounded-md">
                    <SimpleFilterableSelect
                      options={categories}
                      setvalue={setCategory}
                      placeholder="Select category"
                      value={category}
                      className="border-none rounded-none"
                      // onChange={(item) => setCategory(item.value)}
                    />

                    <div className="relative flex-1">
                      <Input
                        placeholder="Search for items..."
                        className="border-none rounded-none pr-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <Button size="sm" className="absolute right-1 top-1 h-8">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center ">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative hover:text-primary"
                  >
                    <Heart className="w-5 h-5" />
                    <Badge className="absolute -top-2 -right-2 bg-primary text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center p-0">
                      0
                    </Badge>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative hover:text-primary"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <Badge className="absolute -top-2 -right-2 bg-primary text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center p-0">
                      3
                    </Badge>
                  </Button>

                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className={`transition-all duration-500 `}>
            <HeaderNav />
          </div>
        </Screen>
      </header>
    </>
  );
};

export default Header;

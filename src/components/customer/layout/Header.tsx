"use client";

import { Screen } from "@/@core/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Menu, ShoppingCart } from "lucide-react";
import { useWindowScroll } from "react-use";
import Topbar from "./Topbar";

// Shad
import { MainLogo } from "@/components/logo/MainLogo";
import { Separator } from "@/components/ui/separator";
import MainSearchbar from "../searchbar/MainSearchbar";
import HeaderNav from "./HeaderNav";

const Header = () => {
  const { y } = useWindowScroll();

  const navigationItems = [
    { name: "Home", href: "/", active: true },
    { name: "Shop", href: "/shop" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
    { name: "About Us", href: "/about" },
  ];

  return (
    <>
      <header className="bg-background text-foreground sticky top-0 z-50 transition-all duration-300 ">
        {/* Top Bar */}
        <div
          className={`hidden lg:block w-full transition-all duration-300 ${
            y > 0
              ? "w-10 -translate-y-24 opacity-0 h-0"
              : "translate-y-0 opacity-100"
          }`}
        >
          <Screen>
            <Topbar />
          </Screen>
          <Separator className="bg-border/80" />

          {/* Main Header */}
          <div>
            <Screen>
              <div
                className={`transition-all duration-300 ${
                  y > 0 ? "-mt-14" : "mt-0"
                } py-4`}
              >
                <div className="w-full   sm:px-6 ">
                  <div className=" flex items-center justify-between">
                    {/* Logo */}
                    <MainLogo />

                    {/* Search Bar */}
                    <MainSearchbar />

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
            </Screen>
            <Separator className="bg-border/80" />
          </div>
        </div>
        {/* Navigation */}

        <div className={`transition-all duration-500 `}>
          <Screen>
            <HeaderNav y={y} />
          </Screen>
        </div>
      </header>
    </>
  );
};

export default Header;

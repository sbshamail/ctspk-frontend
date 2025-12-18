"use client";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useWindowScroll } from "react-use";

// Component
import { Screen } from "@/@core/layout";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import { MainLogo } from "@/components/logo/MainLogo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";
import MainSearchbar from "../searchbar/MainSearchbar";
import { HeaderNav } from "./HeaderNav";
import Topbar from "./Topbar";
// Types

export const MainHeader = ({ y = 0 }: { y?: number }) => {
  return (
    <div className="w-full">
      <Screen>
        <div
          className={`transition-all duration-300 ${
            y > 0 ? "-mt-14" : "mt-0"
          } py-1`}
        >
          <div className="w-full   sm:px-0 ">
            <div className=" flex items-center justify-between">
              {/* Logo */}
              <MainLogo />

              {/* Search Bar */}
              <Suspense fallback={<LayoutSkeleton header={true} />}>
                <MainSearchbar />
              </Suspense>

              {/* Right Actions */}
              <div className="flex items-center gap-4 text-base  ">
                <Link href="/product" className="hover:underline Transition">
                  All Products
                </Link>

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
  );
};

interface IHeader {}
const Header = ({}: IHeader) => {
  const { y } = useWindowScroll();

  // const navigationItems = [
  //   { name: "Home", href: "/", active: true },
  //   { name: "Shop", href: "/shop" },
  //   { name: "Blog", href: "/blog" },
  //   { name: "Contact", href: "/contact" },
  //   { name: "About Us", href: "/about" },
  // ];

  return (
    <>
      <header className="bg-background text-foreground sticky top-0 z-50 transition-all duration-300 ">
        {/* Top Bar */}
        <div
          className={` w-full transition-all duration-300 ${
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
          <MainHeader y={y} />
        </div>
        {/* Navigation */}

        <div className={`transition-all duration-500 `}>
          <Screen>
            <HeaderNav y={y} />
          </Screen>
        </div>
        <Separator className="bg-border/80" />
      </header>
    </>
  );
};

export default Header;

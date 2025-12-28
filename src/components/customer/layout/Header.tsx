"use client";
import { Menu, X, Home, ShoppingBag, Heart, User, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useWindowScroll } from "react-use";

// Component
import { Screen } from "@/@core/layout";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import { MainLogo } from "@/components/logo/MainLogo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Suspense, useEffect, useState } from "react";
import MainSearchbar from "../searchbar/MainSearchbar";
import { HeaderNav } from "./HeaderNav";
import Topbar from "./Topbar";
// Types

interface MainHeaderProps {
  y?: number;
  mounted?: boolean;
  onMenuOpen?: () => void;
}

export const MainHeader = ({ y = 0, mounted = false, onMenuOpen }: MainHeaderProps) => {
  const isScrolled = mounted && y > 0;
  return (
    <div className="w-full">
      <Screen>
        <div
          className={`transition-all duration-300 ${
            isScrolled ? "-mt-14" : "mt-0"
          } py-1`}
        >
          <div className="w-full sm:px-0">
            <div className="flex items-center justify-between">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-2"
                onClick={onMenuOpen}
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Logo */}
              <MainLogo />

              {/* Search Bar - Hidden on mobile */}
              <div className="hidden md:block flex-1">
                <Suspense fallback={<LayoutSkeleton header={true} />}>
                  <MainSearchbar />
                </Suspense>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-4 text-base">
                <Link href="/product" className="hover:underline transition hidden sm:block">
                  All Products
                </Link>
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
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isScrolled = mounted && y > 0;

  const mobileMenuLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "All Products", href: "/product", icon: ShoppingBag },
    { name: "New Arrivals", href: "/new-arrivals", icon: ChevronRight },
    { name: "Sales", href: "/sales", icon: ChevronRight },
    { name: "Limited Edition", href: "/limited-edition", icon: ChevronRight },
    { name: "Best Sellers", href: "/best-sellers", icon: ChevronRight },
    { name: "Trending Now", href: "/trending-now", icon: ChevronRight },
    { name: "Wishlist", href: "/wishlist", icon: Heart },
    { name: "My Account", href: "/profile", icon: User },
  ];

  return (
    <>
      <header className="bg-background text-foreground sticky top-0 z-50 transition-all duration-300">
        {/* Top Bar */}
        <div
          className={`w-full transition-all duration-300 ${
            isScrolled
              ? "w-10 -translate-y-24 opacity-0 h-0"
              : "translate-y-0 opacity-100"
          }`}
        >
          <Screen>
            <Topbar />
          </Screen>
          <Separator className="bg-border/80" />

          {/* Main Header */}
          <MainHeader y={y} mounted={mounted} onMenuOpen={() => setMobileMenuOpen(true)} />
        </div>
        {/* Navigation - Hidden on mobile */}
        <div className="hidden lg:block transition-all duration-500">
          <Screen>
            <HeaderNav y={y} mounted={mounted} />
          </Screen>
        </div>
        <Separator className="bg-border/80" />
      </header>

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center justify-between">
              <MainLogo />
            </SheetTitle>
          </SheetHeader>

          {/* Mobile Search */}
          <div className="p-4 border-b">
            <Suspense fallback={<div className="h-10 bg-muted animate-pulse rounded" />}>
              <MainSearchbar />
            </Suspense>
          </div>

          {/* Mobile Navigation Links */}
          <nav className="flex flex-col">
            {mobileMenuLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-accent/50 transition-colors border-b border-border/50"
              >
                <link.icon className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{link.name}</span>
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Header;

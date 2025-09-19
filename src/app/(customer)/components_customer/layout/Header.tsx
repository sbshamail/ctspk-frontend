"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputElementType } from "@/utils/reactTypes";
import { Heart, Menu, Search, ShoppingCart, User } from "lucide-react";
import { useState } from "react";
import { useWindowScroll } from "react-use";
import { ThemeToggle } from "@/@core/theme/ThemeToggle";

const Topbar = () => (
  <div className="bg-muted py-2">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center text-sm">
        <div className="hidden md:block">
          <span className="text-primary">
            📞 Free Shipping on Order 2000/-Rs
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="hover:text-primary transition-colors">
            Sign In
          </button>
          <button className="hover:text-primary transition-colors">
            Register
          </button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  </div>
);

const Header = () => {
  const { y } = useWindowScroll();
  const [searchQuery, setSearchQuery] = useState("");

  const navigationItems = [
    { name: "Home", href: "/", active: true },
    { name: "Shop", href: "/shop" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
    { name: "About Us", href: "/about" },
  ];

  return (
    <header className="bg-background text-foreground sticky top-0 z-50 transition-all duration-300">
      {/* Top Bar */}
      <div
        className={`w-full transition-all duration-300 ${
          y > 0 ? "w-10 -translate-y-24 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <Topbar />
      </div>

      {/* Main Header */}
      <div
        className={`transition-all duration-300 ${
          y > 0 ? "-mt-10" : "mt-0"
        } py-4`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <h1 className="text-2xl font-bold">
              <span className="text-primary">GHER &nbsp;</span>TAK
            </h1>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search Here"
                  value={searchQuery}
                  onChange={(e: InputElementType) =>
                    setSearchQuery(e.target.value)
                  }
                  className="w-full pl-4 pr-12 py-3 rounded-lg border-0 bg-card text-foreground"
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1 bg-primary hover:bg-primary/90 text-white rounded-md px-4"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="hover:text-primary hidden md:flex"
              >
                <User className="w-5 h-5 mr-1" />
                <span className="text-sm">Sign In</span>
              </Button>

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
      <nav className="bg-muted border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex space-x-8">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`py-4 px-2 text-sm font-medium transition-colors ${
                    item.active
                      ? "text-primary border-b-2 border-primary"
                      : "hover:text-primary"
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </div>
            <div className="hidden md:block text-sm text-muted-foreground">
              📞 Support: +92 330 5817334
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

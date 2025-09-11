"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputElementType } from "@/utils/reactTypes";
import { Heart, Menu, Search, ShoppingCart, User } from "lucide-react";
import { useState } from "react";
import { useWindowScroll } from "react-use";

const Topbar = () => (
  <div className="bg-slate-800 py-2">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center text-sm">
        <div className="hidden md:block">
          <span className="text-orange-400">
            📞 Free Shipping on Order $100
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="hover:text-orange-400 transition-colors">
            Sign In
          </button>
          <button className="hover:text-orange-400 transition-colors">
            Register
          </button>
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
    <header className="bg-slate-900 text-white sticky top-0 z-50 transition-all duration-300">
      {/* Top Bar */}
      <div
        className={` w-full transition-all duration-300 ${
          y > 0 ? "w-10 -translate-y-24 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <div className="">
          <Topbar />
        </div>
      </div>

      {/* Main Header */}
      <div
        className={`transition-all duration-300 ${
          y > 0 ? "-mt-10" : "mt-0" // 👈 animate margin instead of snapping
        } py-4`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">
                <span className="text-orange-400">Electra</span>Bay
              </h1>
            </div>

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
                  className="w-full pl-4 pr-12 py-3 rounded-lg border-0 bg-white text-slate-900"
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1 bg-orange-500 hover:bg-orange-600 text-white rounded-md px-4"
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
                className="text-white hover:text-orange-400 hidden md:flex"
              >
                <User className="w-5 h-5 mr-1" />
                <span className="text-sm">Sign In</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-orange-400 relative"
              >
                <Heart className="w-5 h-5" />
                <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center p-0">
                  0
                </Badge>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-orange-400 relative"
              >
                <ShoppingCart className="w-5 h-5" />
                <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center p-0">
                  3
                </Badge>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-white"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={` bg-slate-800 border-t border-slate-700`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex space-x-8">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`py-4 px-2 text-sm font-medium transition-colors ${
                    item.active
                      ? "text-orange-400 border-b-2 border-orange-400"
                      : "text-white hover:text-orange-400"
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </div>
            <div className="hidden md:block text-sm text-gray-300">
              📞 Support: +1 234 567 890
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

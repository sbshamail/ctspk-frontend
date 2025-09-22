"use client";

import Link from "next/link";
import { Phone, User, Heart, Truck, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Screen } from "@/@core/layout";
import { ThemeToggle } from "@/@core/theme/ThemeToggle";

export default function Topbar() {
  return (
    <div className="  bg-background text-foreground">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-2 text-sm">
          {/* Left: Info links */}
          <div className="">
            <ul className="flex gap-4 text-muted-foreground">
              <li>
                <Link
                  href="#"
                  className="hover:text-primary transition-colors flex items-center gap-1"
                >
                  <User className="w-4 h-4" />
                  About Us
                </Link>
              </li>
              {/* <li>
                <Link
                  href="#"
                  className="hover:text-primary transition-colors flex items-center gap-1"
                >
                  <User className="w-4 h-4" />
                  My Account
                </Link>
              </li> */}
              {/* <li>
                <Link
                  href="#"
                  className="hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Heart className="w-4 h-4" />
                  Wishlist
                </Link>
              </li> */}
              <li>
                <Link
                  href="#"
                  className="hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Truck className="w-4 h-4" />
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Store className="w-4 h-4" />
                  Seller
                </Link>
              </li>
            </ul>
          </div>

          <div className="hidden md:block">
            <span className="text-primary">
              📞 Free Shipping on Order 2000/-Rs
            </span>
          </div>

          {/* Right: Contact */}
          <div className="col-span-3 flex justify-end">
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
    </div>
  );
}

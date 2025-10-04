"use client";

import { ThemeToggle } from "@/@core/theme/ThemeToggle";
import { Store, Truck, User } from "lucide-react";
import Link from "next/link";

export default function Topbar() {
  return (
    <div className="hidden lg:block  bg-background text-foreground">
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
              <Link href={"/login"}>
                <button className="hover:text-primary transition-colors cursor-pointer">
                  Sign In
                </button>
              </Link>
              <Link href={"/register"} className="">
                <button className="hover:text-primary transition-colors cursor-pointer">
                  Register
                </button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

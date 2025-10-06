"use client";

import { ThemeToggle } from "@/@core/theme/ThemeToggle";
import { clearSession, clientUserRaw } from "@/action/auth";
import { Store, Truck, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Topbar() {
  const [user, setUser] = useState<any>(null);

  // ✅ Load on mount
  useEffect(() => {
    setUser(clientUserRaw());

    // ✅ Watch for cookie changes (login/logout)
    const interval = setInterval(() => {
      const current = clientUserRaw();
      // simple check
      if (JSON.stringify(current) !== JSON.stringify(user)) {
        setUser(current);
      }
    }, 100); // every 1s — simple and reliable for modal login

    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    clearSession(); // remove cookie
    setUser(null); // re-render UI
  };
  return (
    <div className="hidden lg:block  bg-background text-foreground">
      <div className=" mx-auto px-4">
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
              {!user ? (
                <>
                  <Link href={"/login"} scroll={false}>
                    <button className="hover:text-primary transition-colors cursor-pointer">
                      Sign In
                    </button>
                  </Link>
                  <Link href={"/register"} scroll={false}>
                    <button className="hover:text-primary transition-colors cursor-pointer">
                      Register
                    </button>
                  </Link>
                </>
              ) : (
                <button
                  className="hover:text-primary transition-colors cursor-pointer"
                  onClick={() => handleLogout()}
                >
                  Logout{" "}
                </button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

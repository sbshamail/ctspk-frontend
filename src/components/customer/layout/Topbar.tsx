"use client";

import { ThemeToggle } from "@/@core/theme/ThemeToggle";
import SiginModal from "@/components/modals/auth/SiginModal";
import RegisterModal from "@/components/modals/auth/RegisterModal";
import { cn } from "@/lib/utils";

import { useSelection } from "@/lib/useSelection";
import { Truck, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AuthHeaderDropdown from "../dropdown/AuthHeaderDropdown";
export default function Topbar() {
  const [openSiginModal, setOpenSiginModal] = useState(false);
  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const { data: auth, isLoading } = useSelection("auth");

  return (
    <>
      <div className="hidden lg:block  bg-background text-foreground">
        <div className=" mx-auto px-4">
          <div className="flex justify-between items-center py-2 text-sm">
            {/* Left: Info links */}
            <div className="">
              <ul className="flex gap-4 text-muted-foreground">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <User className="w-4 h-4" />
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/track-order"
                    className="hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <Truck className="w-4 h-4" />
                    Order Tracking
                  </Link>
                </li>
              </ul>
            </div>

            <div className="hidden md:block">
              <span className="text-primary">
                Free Shipping on Order 2000/-Rs
              </span>
            </div>

            {/* Right: Contact */}
            <div className="col-span-3 flex justify-end">
              <div
                className={cn(
                  "flex items-center space-x-4",
                  isLoading && "animate-pulse" // ✅ Correct conditional class
                )}
              >
                {isLoading ? (
                  <>
                    <div className="h-6 w-6 rounded-full bg-muted" />
                    <div className="h-6 w-6 rounded-full bg-muted" />
                  </>
                ) : (
                  <>
                    {!auth ? (
                      <>
                        <SiginModal
                          open={openSiginModal}
                          setOpen={setOpenSiginModal}
                        />
                        <RegisterModal
                          open={openRegisterModal}
                          setOpen={setOpenRegisterModal}
                        />
                      </>
                    ) : (
                      <AuthHeaderDropdown auth={auth} />
                    )}
                  </>
                )}
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

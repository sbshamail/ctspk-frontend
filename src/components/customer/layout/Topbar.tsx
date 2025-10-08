"use client";

import { ThemeToggle } from "@/@core/theme/ThemeToggle";
import { clearSession } from "@/action/auth";
import SiginModal from "@/components/modals/SiginModal";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { RootState } from "@/store";
import { logoutUser } from "@/store/features/authSlice";
import { Store, Truck, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Topbar() {
  const dispatch = useAppDispatch();
  const [openSiginModal, setOpenSiginModal] = useState(false);
  const { auth, isLoading } = useAppSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    clearSession(); // remove cookie
    dispatch(logoutUser());
  };
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

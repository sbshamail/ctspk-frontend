"use client";

import { ThemeToggle } from "@/@core/theme/ThemeToggle";
import SiginModal from "@/components/modals/auth/SiginModal";
import { cn } from "@/lib/utils";

import { useSelection } from "@/lib/useSelection";
import { Truck, Bell } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AuthHeaderDropdown from "../dropdown/AuthHeaderDropdown";
import { useGetUnreadCountQuery } from "@/store/services/notificationApi";
import { Badge } from "@/components/ui/badge";
export default function Topbar() {
  const [openSiginModal, setOpenSiginModal] = useState(false);
  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const { data: auth, isLoading } = useSelection("auth");
  const { data: unreadCountData } = useGetUnreadCountQuery(undefined, {
    skip: !auth, // Only fetch if user is logged in
    pollingInterval: 30000, // Poll every 30 seconds
  });

  const unreadCount = unreadCountData?.data?.unread_count || 0;

  return (
    <>
      <div className="hidden lg:block  bg-background text-foreground">
        <div className=" mx-auto px-0">
          <div className="flex justify-between items-center py-2 text-sm">
            {/* Left: Info links */}
            <div className="">
              <ul className="flex gap-4 text-muted-foreground">
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
                Free Shipping on Order 3000/-Rs.
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
                        {/* <RegisterModal
                          open={openRegisterModal}
                          setOpen={setOpenRegisterModal}
                        /> */}
                      </>
                    ) : (
                      <>
                        <Link href="/notifications" className="relative hover:text-primary transition-colors">
                          <Bell className="w-6 h-6" />
                          {unreadCount > 0 && (
                            <Badge
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                            >
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                          )}
                        </Link>
                        <AuthHeaderDropdown auth={auth} />
                      </>
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

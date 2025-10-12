"use client";
import { clearSession } from "@/action/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch } from "@/lib/hooks";
import { logoutUser } from "@/store/features/authSlice";
import { AuthDataType } from "@/utils/modelTypes";
import { LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface AuthHeaderDropdownProps {
  auth: AuthDataType;
}
const AuthHeaderDropdown = ({ auth }: AuthHeaderDropdownProps) => {
  const dispatch = useAppDispatch();
  const { user } = auth || {};
  const handleLogout = () => {
    clearSession(); // remove cookie
    dispatch(logoutUser());
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
          {user?.image ? (
            <Image
              src={user.image.original}
              alt={user.name}
              width={30}
              height={30}
              className="rounded-full object-cover"
            />
          ) : (
            <User className="w-6 h-6" />
          )}
          <span className="hidden sm:inline">{user?.name || "Account"}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="center" className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/my-orders" className="cursor-pointer">
            My Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/wishlist">Wishlist</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/my-coupons" className="cursor-pointer">
            My Coupons
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/payments" className="cursor-pointer">
            Payments
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/return-refund" className="cursor-pointer">
            Return & Refund Policy
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/become-seller" className="cursor-pointer">
            Become a Seller
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleLogout()}
          className="text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuthHeaderDropdown;

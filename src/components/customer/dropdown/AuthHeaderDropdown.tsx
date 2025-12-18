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
import { clearCart } from "@/store/features/localCartSlice";
import { AuthDataType } from "@/utils/modelTypes";
import { LogOut, User, Bell, Store, Heart, ShoppingBag, RotateCcw, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AuthHeaderDropdownProps {
  auth: AuthDataType;
}
const AuthHeaderDropdown = ({ auth }: AuthHeaderDropdownProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = auth || {};
  const handleLogout = () => {
    clearSession(); // remove cookie and localStorage cart
    dispatch(clearCart()); // ✅ Clear Redux local cart state
    dispatch(logoutUser()); // Clear auth state and trigger page refresh
    router.refresh();
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
          <Link href="/notifications" className="cursor-pointer">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/my-orders" className="cursor-pointer">
            <ShoppingBag className="mr-2 h-4 w-4" />
            My Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/wishlist" className="cursor-pointer">
            <Heart className="mr-2 h-4 w-4" />
            Wishlist
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profiles" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/my-returns" className="cursor-pointer">
            <RotateCcw className="mr-2 h-4 w-4" />
            Return & Refund
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/wallet" className="cursor-pointer">
            <Wallet className="mr-2 h-4 w-4" />
            Wallet
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/become-seller" className="cursor-pointer">
            <Store className="mr-2 h-4 w-4" />
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

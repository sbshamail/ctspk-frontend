"use client";
import { Home, ShoppingCart, Heart, User, Menu, X, Info, FileText, HelpCircle } from "lucide-react";
import Link from "next/link";
import SiginModal from "@/components/modals/auth/SiginModal";
import { useSelection } from "@/lib/useSelection";
import { useState, useEffect } from "react";
import { useCart } from "@/context/cartContext";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useGetWishlistQuery } from "@/store/services/wishlistAPi";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const MobileBottomBar = () => {
  const { data: auth } = useSelection("auth", true);
  const [openSiginModal, setOpenSiginModal] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const { cart } = useCart();
  const pathname = usePathname();

  const { data: wishlistData } = useGetWishlistQuery(undefined, {
    skip: !auth,
  });

  const cartCount = cart?.length || 0;
  const wishlistCount = wishlistData?.total || 0;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const menuGroups = [
    {
      title: "Account",
      links: [
        { name: "My Profile", href: "/profile" },
        { name: "My Orders", href: "/orders" },
        { name: "Track Order", href: "/track-order" },
        { name: "My Wishlist", href: "/wishlist" },
      ],
    },
    {
      title: "About Us",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Contact Us", href: "/contact" },
        { name: "Our Team", href: "/teams" },
      ],
    },
    {
      title: "Information",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms & Conditions", href: "/terms" },
        { name: "Returns Policy", href: "/returns" },
        { name: "Customer Support", href: "/support" },
      ],
    },
  ];

  const handleAccountClick = () => {
    if (!auth && hasMounted) {
      setOpenSiginModal(true);
    }
  };

  const NavItem = ({
    icon: Icon,
    name,
    href,
    badge,
    isActive,
    onClick
  }: {
    icon: any;
    name: string;
    href?: string | null;
    badge?: number;
    isActive?: boolean;
    onClick?: () => void;
  }) => {
    const content = (
      <>
        <div className="relative">
          <Icon className="w-5 h-5" />
          {badge !== undefined && badge > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5 hidden min-[360px]:block sm:text-xs sm:mt-1">{name}</span>
      </>
    );

    const className = cn(
      "flex flex-col items-center justify-center py-1 px-2 sm:px-3 rounded-lg transition-colors",
      isActive
        ? "text-primary bg-accent/50"
        : "text-muted-foreground hover:text-primary hover:bg-accent/50"
    );

    if (onClick) {
      return (
        <button onClick={onClick} className={className}>
          {content}
        </button>
      );
    }

    return (
      <Link href={href || "/"} className={className}>
        {content}
      </Link>
    );
  };

  return (
    <>
      <div className="py-2 border-t border-border fixed bottom-0 w-full z-50 bg-background">
        <div className="flex items-center justify-around px-2">
          <NavItem
            icon={Home}
            name="Home"
            href="/"
            isActive={pathname === "/"}
          />

          <NavItem
            icon={Heart}
            name="Wishlist"
            href="/wishlist"
            badge={wishlistCount}
            isActive={pathname === "/wishlist"}
          />

          <NavItem
            icon={ShoppingCart}
            name="Cart"
            href="/cart"
            badge={cartCount}
            isActive={pathname === "/cart"}
          />

          {auth ? (
            <NavItem
              icon={User}
              name="Account"
              href="/profile"
              isActive={pathname === "/profile"}
            />
          ) : (
            <NavItem
              icon={User}
              name="Sign In"
              onClick={handleAccountClick}
            />
          )}

          <NavItem
            icon={Menu}
            name="Menu"
            onClick={() => setOpenMenu(true)}
          />
        </div>
      </div>

      {/* Menu Sheet */}
      <Sheet open={openMenu} onOpenChange={setOpenMenu}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-xl">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <div className="overflow-y-auto py-4 space-y-6">
            {menuGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpenMenu(false)}
                      className="block px-3 py-2.5 rounded-lg text-foreground hover:bg-accent/50 transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {!auth && hasMounted && (
              <div className="pt-4 border-t">
                <button
                  onClick={() => {
                    setOpenMenu(false);
                    setOpenSiginModal(true);
                  }}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Sign In / Register
                </button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Sign In Modal */}
      {hasMounted && (
        <SiginModal open={openSiginModal} setOpen={setOpenSiginModal} />
      )}
    </>
  );
};

"use client";
import { useCartService } from "@/lib/cartService";
import { CartItemType } from "@/utils/modelTypes";
import { createContext, useContext, useEffect, useRef } from "react";

export interface CartServiceType {
  cart: CartItemType[];
  add: (
    item: CartItemType & { variation_option_id?: number | null }
  ) => Promise<void>;
  update: (id: number, qty: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
  removeSelected: (ids: number[]) => Promise<void>;
  clear: () => Promise<void>;
  isAuth: boolean;
  loading: boolean;
  refetchCart: () => void;
}

const CartContext = createContext<CartServiceType>(null!);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const cartService = useCartService();
  const prevAuthRef = useRef(cartService.isAuth);

  // ✅ Refetch cart when auth state changes
  useEffect(() => {
    // Only refetch when transitioning to authenticated state
    if (cartService.isAuth && !prevAuthRef.current) {
      // Clear the session storage flag to allow fresh fetch
      sessionStorage.removeItem("cartFetched");
      cartService.refetchCart();
    }

    prevAuthRef.current = cartService.isAuth;
  }, [cartService.isAuth, cartService.refetchCart]);

  return (
    <CartContext.Provider value={cartService}>{children}</CartContext.Provider>
  );
};

// Hook to access globally anywhere
export const useCart = () => useContext(CartContext);

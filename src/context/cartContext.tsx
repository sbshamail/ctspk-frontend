"use client";
import {
  addToCart,
  CartItem,
  clearCart,
  loadCart,
  removeCartItem,
  updateCartItem,
} from "@/action/cart";
import { createContext, useContext, useEffect, useState } from "react";

interface CartContextType {
  cart: CartItem[];
  add: (item: CartItem) => void;
  update: (id: string | number, qty: number) => void;
  remove: (id: string | number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(loadCart());
  }, []);

  const add = async (item: CartItem) => {
    const updatedCart = await addToCart(item); // ✅ wait for backend/local update
    setCart([...updatedCart]);
  };

  const update = async (id: string | number, qty: number) => {
    let updatedCart = await updateCartItem(id, qty);
    setCart([...updatedCart]);
  };
  const remove = (id: string | number) => setCart([...removeCartItem(id)]);
  const clear = () => {
    clearCart();
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, add, update, remove, clear }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};

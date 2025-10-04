"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  CartItem,
  loadCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "@/action/cart";

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

  const add = (item: CartItem) => setCart([...addToCart(item)]);
  const update = (id: string | number, qty: number) =>
    setCart([...updateCartItem(id, qty)]);
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

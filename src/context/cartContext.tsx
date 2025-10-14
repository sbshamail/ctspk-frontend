// "use client";
// import {
//   addToCart,
//   CART_KEY,
//   CartItem,
//   clearCart,
//   loadCartStorage,
//   removeCartItem,
//   updateCartItem,
// } from "@/action/cart";
// import { createContext, useContext, useEffect, useState } from "react";

// interface CartContextType {
//   cart: CartItem[];
//   add: (item: CartItem) => void;
//   update: (id: string | number, qty: number) => void;
//   remove: (id: string | number) => void;
//   clear: () => void;
//   clearCartStorage: () => void;
// }

// const CartContext = createContext<CartContextType | null>(null);

// export const CartProvider = ({ children }: { children: React.ReactNode }) => {
//   const [cart, setCart] = useState<CartItem[]>([]);

//   useEffect(() => {
//     setCart(loadCartStorage());
//   }, []);

//   const add = async (item: CartItem) => {
//     const updatedCart = await addToCart(item); // ✅ wait for backend/local update
//     setCart([...updatedCart]);
//   };

//   const update = async (id: string | number, qty: number) => {
//     let updatedCart = await updateCartItem(id, qty);
//     setCart([...updatedCart]);
//   };
//   const remove = async (id: string | number) => {
//     let updatedCart = await removeCartItem(id);
//     return setCart([...updatedCart]);
//   };
//   const clearCartStorage = () => {
//     localStorage.removeItem(CART_KEY);
//     setCart([]);
//   };
//   const clear = () => {
//     clearCart();
//     setCart([]);
//   };

//   return (
//     <CartContext.Provider
//       value={{ cart, add, update, remove, clear, clearCartStorage }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };

// export const useCart = () => {
//   const ctx = useContext(CartContext);
//   if (!ctx) throw new Error("useCart must be used inside CartProvider");
//   return ctx;
// };

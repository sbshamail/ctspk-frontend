import type { CartItem } from "@/action/cart";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const CART_KEY = "myapp_cart";

const loadCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(CART_KEY);
  return data ? JSON.parse(data) : [];
};
const saveCart = (cart: CartItem[]) =>
  localStorage.setItem(CART_KEY, JSON.stringify(cart));

const initialState = {
  items: loadCart(),
};

const localCartSlice = createSlice({
  name: "localCart",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const index = state.items.findIndex((i) => i.id === action.payload.id);
      if (index >= 0) state.items[index].quantity += action.payload.quantity;
      else state.items.push(action.payload);
      saveCart(state.items);
    },
    updateItem(
      state,
      action: PayloadAction<{ id: string | number; qty: number }>
    ) {
      state.items = state.items.map((i) =>
        i.id === action.payload.id ? { ...i, quantity: action.payload.qty } : i
      );
      saveCart(state.items);
    },
    removeItem(state, action: PayloadAction<string | number>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      saveCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      localStorage.removeItem(CART_KEY);
    },
  },
});

export const { addItem, updateItem, removeItem, clearCart } =
  localCartSlice.actions;
export default localCartSlice.reducer;

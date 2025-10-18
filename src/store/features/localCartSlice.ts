import { CartItemType } from "@/utils/modelTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const CART_KEY = "myapp_cart";

const loadCart = (): CartItemType[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(CART_KEY);
  return data ? JSON.parse(data) : [];
};
const saveCart = (cart: CartItemType[]) =>
  localStorage.setItem(CART_KEY, JSON.stringify(cart));

const initialState = {
  items: loadCart(),
};

const localCartSlice = createSlice({
  name: "localCart",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItemType>) {
      const index = state.items.findIndex(
        (i) => i.product.id === action.payload.product.id
      );
      if (index >= 0) state.items[index].quantity += action.payload.quantity;
      else state.items.push(action.payload);
      saveCart(state.items);
    },
    updateItem(state, action: PayloadAction<{ id: number; qty: number }>) {
      state.items = state.items.map((i) =>
        i.product.id === action.payload.id
          ? { ...i, quantity: action.payload.qty }
          : i
      );
      saveCart(state.items);
    },
    removeItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter((i) => i.product.id !== action.payload);
      saveCart(state.items);
    },
    removeSelectedItem(state, action: PayloadAction<number[]>) {
      const idsToRemove = action.payload; // e.g. [1, 2, 4]
      state.items = state.items.filter(
        (i) => !idsToRemove.includes(i.product.id)
      );
      saveCart(state.items);
    },

    clearCart(state) {
      state.items = [];
      localStorage.removeItem(CART_KEY);
    },
  },
});

export const {
  addItem,
  updateItem,
  removeItem,
  removeSelectedItem,
  clearCart,
} = localCartSlice.actions;
export default localCartSlice.reducer;

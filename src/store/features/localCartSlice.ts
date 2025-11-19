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
      // Match by both product ID and variation_option_id for variable products
      const index = state.items.findIndex((i) => {
        const productMatch = i.product.id === action.payload.product.id;
        const variationMatch = i.variation_option_id === action.payload.variation_option_id;
        return productMatch && variationMatch;
      });

      if (index >= 0) {
        // If same product+variation exists, increment quantity
        state.items[index].quantity += action.payload.quantity;
      } else {
        // Otherwise add as new item
        state.items.push(action.payload);
      }
      saveCart(state.items);
    },
    updateItem(state, action: PayloadAction<{ id: number; qty: number; variation_option_id?: number | null }>) {
      state.items = state.items.map((i) => {
        const productMatch = i.product.id === action.payload.id;
        // If variation_option_id is provided, match it too
        if (action.payload.variation_option_id !== undefined) {
          const variationMatch = i.variation_option_id === action.payload.variation_option_id;
          return productMatch && variationMatch ? { ...i, quantity: action.payload.qty } : i;
        }
        // For simple products, just match by product ID
        return productMatch ? { ...i, quantity: action.payload.qty } : i;
      });
      saveCart(state.items);
    },
    removeItem(state, action: PayloadAction<number | { id: number; variation_option_id?: number | null }>) {
      if (typeof action.payload === 'number') {
        // Legacy: remove by product ID only
        state.items = state.items.filter((i) => i.product.id !== action.payload);
      } else {
        // New: remove by product ID and variation
        const payload = action.payload;
        state.items = state.items.filter((i) => {
          const productMatch = i.product.id === payload.id;
          if (payload.variation_option_id !== undefined) {
            const variationMatch = i.variation_option_id === payload.variation_option_id;
            return !(productMatch && variationMatch);
          }
          return !productMatch;
        });
      }
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

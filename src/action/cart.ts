import { ImageType } from "@/utils/modelTypes";
import { getAuth } from "./auth";
import { fetchApi } from "./fetchApi";

// utils/cart.ts
export interface CartItem {
  id: number | string;
  name: string;
  price: number;
  salePrice?: number;
  image: ImageType;
  quantity: number;
  shop_id: number;
}

const CART_KEY = "myapp_cart";

export const loadCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(CART_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveCart = (cart: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};
export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
};
/* ------------------------- 🧠 BACKEND SYNC HELPERS ------------------------ */

export const addToCart = async (item: CartItem) => {
  if (item.quantity <= 0 || !item.id || !item.shop_id) return;

  const { user, token } = getAuth() || {};

  if (user?.id && token) {
    // ✅ Logged-in user → save directly in backend
    const body = {
      product_id: item.id,
      shop_id: item.shop_id,
      quantity: item.quantity,
    };
    const res = await fetchApi({
      url: "cart/create",
      method: "POST",
      data: body,
      token,
    });

    return res?.data || [];
  }

  const cart = loadCart();
  const index = cart.findIndex((i) => i.id === item.id);
  if (index >= 0) {
    cart[index].quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
  return cart;
};

export const updateCartItem = async (id: string | number, qty: number) => {
  if (qty <= 0 || !id) return;
  const { user, token } = getAuth();
  if (user?.id && token) {
    // ✅ Backend update
    const res = await fetchApi({
      url: `cart/update/${id}`,
      method: "PUT",
      data: { quantity: qty },
      token,
    });
    return res?.data || [];
  }
  let cart = loadCart();
  cart = cart.map((item) =>
    item.id === id ? { ...item, quantity: qty } : item
  );
  saveCart(cart);
  return cart;
};

export const removeCartItem = (id: string | number) => {
  let cart = loadCart().filter((i) => i.id !== id);
  saveCart(cart);
  return cart;
};

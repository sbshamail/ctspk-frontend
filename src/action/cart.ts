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

export const CART_KEY = "myapp_cart";

export const loadCartStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(CART_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveCart = (cart: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};
export const clearCart = () => {
  const { user, token } = getAuth() || {};
  if (user?.id && token) {
    // ✅ Logged-in user → delete from backend
    fetchApi({
      url: "cart/delete-all",
      method: "DELETE",
      token,
    });
  } else {
    localStorage.removeItem(CART_KEY);
  }
};

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
  } else {
    const cart = loadCartStorage();
    const index = cart.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      cart[index].quantity += item.quantity;
    } else {
      cart.push(item);
    }
    saveCart(cart);
    return cart;
  }
};

export const updateCartItem = async (
  product_id: string | number,
  qty: number
) => {
  if (qty <= 0 || !product_id) return;
  const { user, token } = getAuth();
  if (user?.id && token) {
    // ✅ Backend update
    const res = await fetchApi({
      url: `cart/update/${product_id}`,
      method: "PUT",
      data: { quantity: qty },
      token,
    });
    return res?.data || [];
  } else {
    let cart = loadCartStorage();
    cart = cart.map((item) =>
      item.id === product_id ? { ...item, quantity: qty } : item
    );
    saveCart(cart);
    return cart;
  }
};

export const removeCartItem = async (product_id: string | number) => {
  const { user, token } = getAuth();

  if (user?.id && token) {
    // ✅ Backend delete
    const res = await fetchApi({
      url: `cart/delete/${product_id}`,
      method: "DELETE",
      token,
    });
    return res?.data || [];
  } else {
    let cart = loadCartStorage().filter((i) => i.id !== product_id);
    saveCart(cart);
    return cart;
  }
};

export const getCartList = async () => {
  const { user, token } = getAuth();

  if (user?.id && token) {
    // ✅ Fetch backend cart
    const res = await fetchApi({
      url: "cart/list",
      method: "GET",
      token,
    });
    clearCart(); // clear local copy
    return res?.data || [];
  } else {
    // 🧩 Guest mode
    return loadCartStorage();
  }
};

// utils/cart.ts
export interface CartItem {
  id: number | string;
  name: string;
  price: number;
  salePrice?: number;
  image: string;
  quantity: number;
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

export const addToCart = (item: CartItem) => {
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

export const updateCartItem = (id: string | number, qty: number) => {
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

export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
};

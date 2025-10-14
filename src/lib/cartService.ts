import {
  addItem,
  clearCart as clearLocal,
  removeItem,
  updateItem,
} from "@/store/features/localCartSlice";
import {
  useAddToCartMutation,
  useClearCartMutation,
  useGetCartQuery,
  useRemoveCartMutation,
  useUpdateCartMutation,
} from "@/store/services/cartApi";

import type { CartItem } from "@/action/cart";
import { RootState } from "@/store";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { useSelection } from "./useSelection";
/**
 * Hook that automatically decides whether to use backend or local cart
 */
export const useCartService = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const dispatch = useAppDispatch();
  const { data: auth } = useSelection("auth");
  const localCart = useAppSelector((s: RootState) => s.localCart.items);
  const isAuth = !!auth?.user?.id;

  // Backend RTK Query Hooks
  const { data: backendCartData } = useGetCartQuery(undefined);
  const [addToBackend] = useAddToCartMutation();
  const [updateBackend] = useUpdateCartMutation();
  const [removeBackend] = useRemoveCartMutation();
  const [clearBackend] = useClearCartMutation();

  useEffect(() => {
    const cartData = isAuth ? backendCartData?.data || [] : localCart;
    console.log("cartData", cartData);
    setCart(cartData);
  }, []);

  const add = async (item: CartItem) => {
    if (isAuth) {
      await addToBackend({
        product_id: item.id,
        shop_id: item.shop_id,
        quantity: item.quantity,
      });
    } else {
      dispatch(addItem(item));
    }
  };

  const update = async (id: string | number, qty: number) => {
    if (isAuth) {
      await updateBackend({ product_id: id, quantity: qty });
    } else {
      dispatch(updateItem({ id, qty }));
    }
  };

  const remove = async (id: string | number) => {
    if (isAuth) {
      await removeBackend(id);
    } else {
      dispatch(removeItem(id));
    }
  };

  const clear = async () => {
    if (isAuth) {
      await clearBackend(null);
    } else {
      dispatch(clearLocal());
    }
  };

  return { cart, add, update, remove, clear, isAuth };
};

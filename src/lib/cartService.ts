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

import { RootState } from "@/store";
import { ImageType } from "@/utils/modelTypes";
import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { useSelection } from "./useSelection";

type Product = {
  id: number;
  name: string;
  price: number;
  salePrice?: number;
  image: ImageType;
};
export interface CartItem {
  quantity: number;
  product: Product;
  shop_id: number;
}

/**
 * Hook that automatically decides whether to use backend or local cart
 */
export const useCartService = () => {
  //   const [cart, setCart] = useState<CartItem[]>([]);
  const dispatch = useAppDispatch();
  const { data: auth } = useSelection("auth");
  const localCart = useAppSelector((s: RootState) => s.localCart.items);
  const isAuth = !!auth?.user?.id;

  // Backend RTK Query Hooks
  const {
    data: backendCartData,
    refetch: refetchBackend,
    isFetching,
    isLoading,
  } = useGetCartQuery(undefined);
  const [addToBackend] = useAddToCartMutation();
  const [updateBackend] = useUpdateCartMutation();
  const [removeBackend] = useRemoveCartMutation();
  const [clearBackend] = useClearCartMutation();
  // 🧠 Re-compute cart whenever auth/local/backend changes
  const cart: CartItem[] = useMemo(
    () => (isAuth ? backendCartData || [] : localCart),
    [isAuth, backendCartData, localCart]
  );

  // 🔁 Auto refetch cart when user logs in
  useEffect(() => {
    if (isAuth) refetchBackend();
  }, [isAuth, refetchBackend]);

  const add = async (item: CartItem) => {
    if (isAuth) {
      await addToBackend({
        product_id: item.product.id,
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

  return { cart, add, update, remove, clear, isAuth, loading: isLoading };
};

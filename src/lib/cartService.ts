import {
  addItem,
  clearCart as clearLocal,
  removeItem,
  updateItem,
} from "@/store/features/localCartSlice";
import {
  cartApi,
  useAddToCartMutation,
  useClearCartMutation,
  useGetCartQuery,
  useRemoveCartMutation,
} from "@/store/services/cartApi";

import { useDebounce } from "@/@core/hooks/useDebounce";
import { useDidUpdateEffect } from "@/@core/hooks/useDidUpdateEffect";
import { fetchApi } from "@/action/fetchApi";
import { RootState } from "@/store";
import { ImageType } from "@/utils/modelTypes";
import { useMemo } from "react";
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
  const [removeBackend] = useRemoveCartMutation();
  const [clearBackend] = useClearCartMutation();
  // 🧠 Re-compute cart whenever auth/local/backend changes
  const cart: CartItem[] = useMemo(
    () => (isAuth ? backendCartData || [] : localCart),
    [isAuth, isFetching, localCart]
  );
  // 🔁 Auto refetch cart when user logs in
  useDidUpdateEffect(() => {
    if (isAuth) refetchBackend();
  }, [isAuth]);

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

  const initiateRefetch = () => {
    dispatch(
      cartApi.endpoints.getCart.initiate(undefined, {
        forceRefetch: true,
      })
    );
  };
  function debounce<T extends (...args: any[]) => void>(fn: T, delay = 2000) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<T>) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        fn(...args);
      }, delay);
    };
  }

  const syncCartUpdate = async (id: number | string, qty: number) => {
    try {
      const res = await fetchApi({
        url: `cart/update/${id}`,
        method: "PUT",
        data: { quantity: qty },
      });

      if (res?.success !== 1) {
        console.warn("Cart update failed:", res?.detail || res?.message);
        initiateRefetch();
      }
    } catch (err) {
      console.error("Cart update error:", err);
      initiateRefetch();
    }
  };

  // ✅ Create one debounced version
  // const debouncedUpdate = useMemo(
  //   () => debounce(syncCartUpdate, 2000),
  //   [] // ✅ same instance for the lifetime of the component
  // );
  const debouncedUpdate = useDebounce(syncCartUpdate, 1000);
  const update = async (id: string | number, qty: number) => {
    if (isAuth) {
      // Instant Redux update
      dispatch(
        cartApi.util.updateQueryData("getCart", undefined, (draft) => {
          if (!Array.isArray(draft)) return;
          const idx = draft.findIndex((i) => i.product.id === id);
          if (idx >= 0) draft[idx] = { ...draft[idx], quantity: qty };
        })
      );
      debouncedUpdate(id, qty);
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

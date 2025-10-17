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

import { useMountAfterEffect } from "@/@core/hooks";
import { useDebounce } from "@/@core/hooks/useDebounce";
import { fetchApi } from "@/action/fetchApi";
import { RootState } from "@/store";
import { CartItemType } from "@/utils/modelTypes";
import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { useSelection } from "./useSelection";

/**
 * Hook that automatically decides whether to use backend or local cart
 */
export const useCartService = () => {
  const dispatch = useAppDispatch();
  const { data: auth } = useSelection("auth");
  const localCart = useAppSelector((s: RootState) => s.localCart.items);
  const isAuth = !!auth?.user?.id;

  // Backend RTK Query Hooks
  // const {
  //   data: backendCartData,
  //   refetch: refetchBackend,
  //   isFetching,
  //   isLoading,
  // } = useGetCartQuery(undefined);
  const {
    data: backendCartData = [],
    refetch: refetchBackend,
    isFetching,
    isLoading,
  } = useGetCartQuery(undefined, {
    selectFromResult: ({ data, isFetching, isLoading }) => ({
      data,
      isFetching,
      isLoading,
    }),
  });

  const [addToBackend] = useAddToCartMutation();
  const [removeBackend] = useRemoveCartMutation();
  const [clearBackend] = useClearCartMutation();
  // 🧠 Re-compute cart whenever auth/local/backend changes
  const cart: CartItemType[] = useMemo(
    () => (isAuth ? backendCartData || [] : localCart),
    [isAuth, localCart, backendCartData]
  );
  // 🔁 Auto refetch cart when user logs in
  useMountAfterEffect(() => {
    if (isAuth) refetchBackend();
  }, [isAuth]);

  const add = async (item: CartItemType) => {
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

  const debouncedUpdate = useDebounce(syncCartUpdate, 1000, (id, qty) => id);

  const update = async (id: string | number, qty: number) => {
    if (isAuth) {
      // Instant Redux Query update manually
      dispatch(
        cartApi.util.updateQueryData("getCart", undefined, (draft) => {
          if (!Array.isArray(draft)) return;

          const idx = draft.findIndex((i: CartItemType) => i.product.id === id);

          if (idx >= 0) {
            // 🔥 Force new object & array reference for UI re-render
            const updated = { ...draft[idx], quantity: qty };
            console.log({ updated });
            draft.splice(idx, 1, updated);
          }
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

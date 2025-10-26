import {
  addItem,
  clearCart as clearLocal,
  removeItem,
  removeSelectedItem,
  updateItem,
} from "@/store/features/localCartSlice";
import {
  cartApi,
  useAddToCartMutation,
  useClearCartMutation,
  useGetCartQuery,
  useRemoveCartMutation,
  useRemoveSelectedCartMutation,
} from "@/store/services/cartApi";

import { useMountAfterEffect, useMountFirstEffect } from "@/@core/hooks";
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

  const {
    data: backendCartData = [],
    refetch: refetchCart,
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
  const [removeSelectedBackend] = useRemoveSelectedCartMutation();
  const [clearBackend] = useClearCartMutation();
  // 🧠 Re-compute cart whenever auth/local/backend changes
  const cart: CartItemType[] = useMemo(
    () => (isAuth ? backendCartData || [] : localCart),
    [isAuth, localCart, backendCartData]
  );
  // 🔁 Auto refetch cart when user logs in
  // useMountAfterEffect(() => {
  //   if (isAuth) refetchCart();
  // }, [isAuth]);
  useMountFirstEffect(() => {
    if (isAuth && !backendCartData.length) {
      refetchCart();
    }
  }, [isAuth]);

  const add = async (item: CartItemType & { variation_option_id?: number | null }) => {
    if (isAuth) {
      await addToBackend({
        product_id: item.product.id,
        shop_id: item.shop_id,
        quantity: item.quantity,
        variation_option_id: item.variation_option_id || null, // ✅ Add variation_option_id
      });
    } else {
      dispatch(addItem({
        ...item,
        variation_option_id: item.variation_option_id || null // ✅ Add to local cart
      }));
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

  const update = async (id: number, qty: number) => {
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

  const remove = async (id: number) => {
    if (isAuth) {
      await removeBackend(id);
    } else {
      dispatch(removeItem(id));
    }
  };
  const removeSelected = async (ids: number[]) => {
    if (isAuth) {
      await removeSelectedBackend(ids);
    } else {
      dispatch(removeSelectedItem(ids));
    }
  };

  const clear = async () => {
    if (isAuth) {
      await clearBackend(null);
    } else {
      dispatch(clearLocal());
    }
  };

  return {
    cart,
    add,
    update,
    remove,
    removeSelected,
    clear,
    isAuth,
    loading: isLoading,
    refetchCart,
  };
};

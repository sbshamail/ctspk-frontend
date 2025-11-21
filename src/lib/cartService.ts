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

import { useMountFirstEffect } from "@/@core/hooks";
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
    skip: !isAuth,
    refetchOnMountOrArgChange: true, // Always refetch when component mounts or auth changes
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

  // Clear session storage when user logs out
  useMountFirstEffect(() => {
    if (!isAuth) {
      sessionStorage.removeItem("cartFetched");
      return;
    }
    const hasFetched = sessionStorage.getItem("cartFetched");
    if (!hasFetched) {
      refetchCart();
      sessionStorage.setItem("cartFetched", "true");
    }
  }, [isAuth]);

  // ##########################################
  // ### Method to update redux immediately and call backend
  // ##########################################
  const syncCartCreate = async (
    product_id: number,
    shop_id: number,
    quantity: number,
    variation_option_id?: number | null
  ) => {
    try {
      const res = await fetchApi({
        url: `cart/create`,
        method: "POST",
        data: { product_id, shop_id, quantity, variation_option_id },
      });

      if (res?.success !== 1) {
        console.warn("Cart update failed:", res?.detail || res?.message);
        // ✅ Force refetch on failure
        refetchCart();
        return;
      }

      // ✅ Always force refetch after successful add to ensure cache is in sync
      refetchCart();
    } catch (err) {
      console.error("Cart update error:", err);
      refetchCart();
    }
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
      }
      // ✅ Always refetch to ensure sync
      refetchCart();
    } catch (err) {
      console.error("Cart update error:", err);
      refetchCart();
    }
  };
  const syncCartDelete = async (id: number | string) => {
    try {
      const res = await fetchApi({
        url: `cart/delete/${id}`,
        method: "DELETE",
      });

      if (res?.success !== 1) {
        console.warn("Cart delete failed:", res?.detail || res?.message);
      }
      // ✅ Always refetch to ensure sync
      refetchCart();
    } catch (err) {
      console.error("Cart delete error:", err);
      refetchCart();
    }
  };
  // ######## This debounced function is called backend fn after 1 second
  const debouncedAdd = useDebounce(
    syncCartCreate,
    1000,
    (product_id, shop_id, quantity, variation_option_id) => product_id
  );
  const debouncedUpdate = useDebounce(syncCartUpdate, 1000, (id, qty) => id);
  const debouncedDelete = useDebounce(syncCartDelete, 1000, (id) => id);
  // ##########################################

  // #######################
  // #### Main Functions
  // #######################
  const add = async (
    item: CartItemType & { variation_option_id?: number | null }
  ) => {
    if (isAuth) {
      // ✅ Call backend API and refetch cart after success
      await syncCartCreate(
        item.product.id,
        item.shop_id,
        item.quantity,
        item.variation_option_id
      );
    } else {
      console.log("Adding to local cart:", item);
      dispatch(
        addItem({
          ...item,
          variation_option_id: item.variation_option_id || null,
        })
      );
    }
  };


  const update = async (id: number, qty: number) => {
    if (isAuth) {
      // ✅ Optimistic update for instant UI feedback
      dispatch(
        cartApi.util.updateQueryData("getCart", undefined, (draft) => {
          if (!Array.isArray(draft)) return;
          const idx = draft.findIndex((i: CartItemType) => i.product.id === id);
          if (idx >= 0) {
            draft[idx] = { ...draft[idx], quantity: qty };
          }
        })
      );
      // ✅ Debounced backend call + refetch
      debouncedUpdate(id, qty);
    } else {
      dispatch(updateItem({ id, qty }));
    }
  };

  const remove = async (id: number) => {
    if (isAuth) {
      // ✅ Optimistic update for instant UI feedback
      dispatch(
        cartApi.util.updateQueryData("getCart", undefined, (draft) => {
          if (!Array.isArray(draft)) return;
          const idx = draft.findIndex((i: CartItemType) => i.product.id === id);
          if (idx >= 0) draft.splice(idx, 1);
        })
      );
      // ✅ Debounced backend call + refetch
      debouncedDelete(id);
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

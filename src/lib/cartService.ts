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
  // ### Method to update redux immediately and call backend after 1 second
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
      const newItem = res?.data;
      if (!newItem) return;

      if (res?.success !== 1) {
        console.warn("Cart update failed:", res?.detail || res?.message);
        initiateRefetch();
      }
    } catch (err) {
      console.error("Cart update error:", err);
      initiateRefetch();
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
        initiateRefetch();
      }
    } catch (err) {
      console.error("Cart update error:", err);
      initiateRefetch();
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
        initiateRefetch();
      }
    } catch (err) {
      console.error("Cart update error:", err);
      initiateRefetch();
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
      // First update the cache optimistically
      const patchResult = dispatch(
        cartApi.util.updateQueryData("getCart", undefined, (draft) => {
          if (!Array.isArray(draft)) return;
          // Match by product ID AND variation_option_id for variable products
          const idx = draft.findIndex((i: CartItemType) => {
            const productMatch = i.product.id === item.product.id;
            const variationMatch = i.variation_option_id === item.variation_option_id;
            return productMatch && variationMatch;
          });
          if (idx >= 0) {
            // Increment quantity if same product+variation exists
            draft[idx] = { ...draft[idx], quantity: draft[idx].quantity + item.quantity };
          } else {
            draft.push(item);
          }
        })
      );

      // Then trigger the backend sync
      debouncedAdd(
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

  const initiateRefetch = () => {
    dispatch(
      cartApi.endpoints.getCart.initiate(undefined, {
        forceRefetch: true,
      })
    );
  };

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
      // console.log("Removing cart:", id);
      // await removeBackend(id);
      // Instant Redux Query update manually
      dispatch(
        cartApi.util.updateQueryData("getCart", undefined, (draft) => {
          if (!Array.isArray(draft)) return;

          const idx = draft.findIndex((i: CartItemType) => i.product.id === id);
          if (idx >= 0) draft.splice(idx, 1);
        })
      );
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

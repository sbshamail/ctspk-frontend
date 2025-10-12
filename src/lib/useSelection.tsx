import { RootState, AppDispatch } from "@/store";
import { useAppSelector, useAppDispatch } from "./hooks";

// ✅ Allowed slice keys (auto-complete)
type SliceKey = keyof RootState;

/**
 * useSelection - universal Redux slice selector with optional dispatch
 *
 * @param key - name of slice in the store ("auth", "category", etc.)
 * @param withDispatch - if true, returns merged state with dispatch
 *
 * @example
 * const auth = useSelection("auth");
 * const { data, isLoading, dispatch } = useSelection("auth", true);
 */
export function useSelection<K extends SliceKey>(
  key: K,
  withDispatch?: false
): RootState[K];
export function useSelection<K extends SliceKey>(
  key: K,
  withDispatch: true
): RootState[K] & { dispatch: AppDispatch };
export function useSelection<K extends SliceKey>(
  key: K,
  withDispatch: boolean = false
) {
  const dispatch = useAppDispatch();
  const sliceState = useAppSelector((state: RootState) => state[key]);

  // ✅ Always call hooks top-level, then conditionally merge
  if (withDispatch) {
    return { ...sliceState, dispatch };
  }
  return sliceState;
}

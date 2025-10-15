import { useEffect, useRef } from "react";

/**
 * Run effect only on updates (not on first mount)
 */
export function useDidUpdateEffect(
  effect: React.EffectCallback,
  deps: React.DependencyList
) {
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    return effect();
  }, deps);
}

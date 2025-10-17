import { useEffect, useRef } from "react";

/**
 * Run effect only on updates (not on first mount)
 */
export function useMountAfterEffect(
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
/**
 * useMountFirstEffect
 * -------------------
 * Runs the effect **only once** when any dependency becomes "ready".
 * - Supports arrays, objects, and primitives.
 * - Accepts multiple dependencies (like useEffect).
 * - Skips first render if dependencies not yet ready.
 * - Never runs more than once.
 *
 * @example
 * useMountFirstEffect(() => {
 *   dispatch(setSelectedCart(cart));
 * }, [cart, user]);
 */
export function useMountFirstEffect(
  effect: React.EffectCallback,
  deps: React.DependencyList
) {
  const hasRun = useRef(false);

  // Check if every dependency is "ready"
  const isReady = deps.every((dep) => {
    if (Array.isArray(dep)) return dep.length > 0;
    if (dep && typeof dep === "object") return Object.keys(dep).length > 0;
    return Boolean(dep);
  });

  useEffect(() => {
    if (!hasRun.current && isReady) {
      hasRun.current = true;
      return effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);
}

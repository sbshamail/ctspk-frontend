import { useMemo, useRef } from "react";

export function useDebounce<T extends (...args: any[]) => void>(
  fn: T,
  delay = 300
) {
  const fnRef = useRef(fn);
  fnRef.current = fn; // always latest fn

  const debouncedFn = useMemo(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<T>) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        fnRef.current(...args); // use latest function
      }, delay);
    };
  }, [delay]); // 👈 only recreate if delay changes

  return debouncedFn;
}

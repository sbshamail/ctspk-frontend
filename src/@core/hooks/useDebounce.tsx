import { useMemo, useRef } from "react";

export function useDebounce<T extends (...args: any[]) => void>(
  fn: T,
  delay = 300,
  getKey?: (...args: Parameters<T>) => string | number
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const timers = useRef<Record<string | number, ReturnType<typeof setTimeout>>>(
    {}
  );

  const debouncedFn = useMemo(() => {
    return (...args: Parameters<T>) => {
      const key = getKey ? getKey(...args) : "default";

      if (timers.current[key]) clearTimeout(timers.current[key]);

      timers.current[key] = setTimeout(() => {
        delete timers.current[key];
        fnRef.current(...args);
      }, delay);
    };
  }, [delay, getKey]);

  return debouncedFn;
}

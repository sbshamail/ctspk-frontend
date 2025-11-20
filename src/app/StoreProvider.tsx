"use client";
import { AppStore, makeStore } from "@/store";
import { setAuth } from "@/store/features/authSlice";
import { useRef } from "react";
import { Provider } from "react-redux";
interface StoreProviderProps {
  children: React.ReactNode;
  serverAuth?: any | null;
}

export default function StoreProvider({
  children,
  serverAuth,
}: StoreProviderProps) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();

    // 🟢 Preload auth state immediately after store creation (not during render)
    if (serverAuth) {
      storeRef.current.dispatch(setAuth(serverAuth));
    }
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}

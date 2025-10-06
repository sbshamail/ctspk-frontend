"use client";

import { RootState } from "@/store";

import { useAppSelector } from "./hooks";

export function useClientUser() {
  const user = useAppSelector((state: RootState) => state.auth.user);
  return user;
}

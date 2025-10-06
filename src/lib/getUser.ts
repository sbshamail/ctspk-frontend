// src/lib/getUser.ts
import { useClientUser } from "./clientUserSide";
import { userServer } from "./serverUserSide";

export async function getUser() {
  const isServer = typeof window === "undefined";
  return isServer ? await userServer() : useClientUser();
}

export const user = await getUser().catch(() => null);

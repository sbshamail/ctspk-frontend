// src/lib/getServerUser.ts
import { UserDataType } from "@/utils/modelTypes";
import { cookies } from "next/headers";
export interface ServerSessionData {
  user: UserDataType | null;
  access_token: string | null;
  refresh_token: string | null;
  user_session_exp: string | null;
}

export async function getServerSession(): Promise<ServerSessionData | null> {
  const cookieStore = await cookies();

  const user = cookieStore.get("user_session")?.value;
  const access_token = cookieStore.get("access_token")?.value || null;
  const refresh_token = cookieStore.get("refresh_token")?.value || null;
  const user_session_exp = cookieStore.get("user_session_exp")?.value || null;

  if (!user || !access_token) return null;

  try {
    const parsedUser = JSON.parse(user) as UserDataType;
    return {
      user: parsedUser,
      access_token,
      refresh_token,
      user_session_exp,
    };
  } catch {
    return null;
  }
}

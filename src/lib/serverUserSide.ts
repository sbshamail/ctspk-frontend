// src/lib/getServerUser.ts
import { cookies } from "next/headers";

// export async function getServerUser() {
//   const cookieStore = await cookies();
//   const token = cookieStore.get("access_token")?.value;

//   if (!token) return null;

//   try {
//     const res = await fetch(`${API_URL}/auth/me`, {
//       headers: { Authorization: `Bearer ${token}` },
//       cache: "no-store",
//     });

//     if (!res.ok) return null;

//     const data = await res.json();
//     return data.user;
//   } catch {
//     return null;
//   }
// }

export async function userServer() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_session")?.value;

  if (!userCookie) return null;
  try {
    return JSON.parse(userCookie);
  } catch {
    return null;
  }
}

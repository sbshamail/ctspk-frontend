import { AuthDataType, UserDataType } from "@/utils/modelTypes";
import Cookies from "js-cookie";

export const saveSession = (
  user: any,
  access_token: string,
  refresh_token: string,
  exp: string
) => {
  // ✅ 1. Store tokens in cookies
  Cookies.set("access_token", access_token, {
    secure: true,
    sameSite: "Strict",
  });
  Cookies.set("refresh_token", refresh_token, {
    secure: true,
    sameSite: "Strict",
  });

  // ✅ 2. Store user info in another cookie (for SSR)
  Cookies.set("user_session", JSON.stringify(user), {
    secure: true,
    sameSite: "Strict",
  });
  Cookies.set("user_session_exp", exp, {
    secure: true,
    sameSite: "Strict",
  });

  //   // ✅ 3. Store in Redux (for CSR)
  //   store.dispatch(setUser(user));
};
type SessionKey =
  | "user_session"
  | "access_token"
  | "refresh_token"
  | "user_session_exp";
export function getSession<T = AuthDataType>(
  key: SessionKey = "user_session"
): T | null {
  const session = Cookies.get(key);
  if (!session) return null;
  try {
    return JSON.parse(session) as T;
  } catch {
    return session as T;
  }
}
export const getAuth = () => {
  const user = getSession<UserDataType>("user_session");
  const token = getSession<"string">("access_token");
  return { user, token };
};
export const clearSession = () => {
  console.log("logout clear session");
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
  Cookies.remove("user_session");
  Cookies.remove("user_session_exp");
  sessionStorage.removeItem("cartFetched");
  //   dispatch(logout());
};

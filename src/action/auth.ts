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
export function clientUser() {
  const session = Cookies.get("user_session");
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
}
export const clearSession = (dispatch?: any) => {
  console.log("clear session");
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
  Cookies.remove("user_session");
  Cookies.remove("user_session_exp");
  //   dispatch(logout());
};

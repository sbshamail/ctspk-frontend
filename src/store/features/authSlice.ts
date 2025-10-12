import { clearSession, getSession } from "@/action/auth";
import { UserDataType } from "@/utils/modelTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  data: any | null;
  isLoading: boolean; // initial load (e.g., check session)
  isError: string | null; // error message if any
}

const user = getSession<UserDataType>("user_session");
const refresh_token = getSession("refresh_token");
const access_token = getSession("access_token");
const user_session_exp = getSession("user_session_exp") as string | null;

function isSessionExpired(expiry: string | null): boolean {
  if (!expiry) return true;
  try {
    const expDate = new Date(expiry).getTime();
    return Date.now() > expDate;
  } catch {
    return true;
  }
}

const isExpired = isSessionExpired(user_session_exp);

const initialState: AuthState = {
  data: !isExpired
    ? {
        user,
        access_token,
        refresh_token,
        user_session_exp,
      }
    : null,
  isLoading: false,
  isError: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ✅ Start loading when app mounts or fetching starts
    authLoading(state, action: PayloadAction<any>) {
      state.isLoading = action.payload;
      state.isError = null;
    },

    // ✅ Auth data management
    setAuth(state, action: PayloadAction<any>) {
      state.data = action.payload;
      state.isLoading = false;
      state.isError = null;
    },
    logoutUser(state) {
      state.data = null;
      state.isError = null;
      clearSession();
    },

    // ✅ Error handler
    setError(state, action: PayloadAction<string>) {
      state.isError = action.payload;
      state.isLoading = false;
    },
    clearError(state) {
      state.isError = null;
    },
  },
});

export const { authLoading, setAuth, logoutUser, setError, clearError } =
  authSlice.actions;

export default authSlice.reducer;

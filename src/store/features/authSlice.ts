import { clearSession } from "@/action/auth";
import { AuthDataType } from "@/utils/modelTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  data: AuthDataType | null;
  isLoading: boolean; // initial load (e.g., check session)
  isError: string | null; // error message if any
}

const initialState: AuthState = {
  data: null,
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
    // ✅ Update token after refresh
    updateToken(state, action: PayloadAction<{ access_token: string; refresh_token?: string }>) {
      if (state.data) {
        state.data.access_token = action.payload.access_token;
        if (action.payload.refresh_token) {
          state.data.refresh_token = action.payload.refresh_token;
        }
      }
    },
    logoutUser(state) {
      state.data = null;
      state.isError = null;
      clearSession();
      window.location.reload(); // refresh
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

export const { authLoading, setAuth, updateToken, logoutUser, setError, clearError } =
  authSlice.actions;

export default authSlice.reducer;

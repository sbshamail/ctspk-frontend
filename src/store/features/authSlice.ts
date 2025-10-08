import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  auth: any | null;
  isLoading: boolean; // initial load (e.g., check session)
  isError: string | null; // error message if any
}

const initialState: AuthState = {
  auth: null,
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
      state.auth = action.payload;
      state.isLoading = false;
      state.isError = null;
    },
    logoutUser(state) {
      state.auth = null;
      state.isError = null;
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

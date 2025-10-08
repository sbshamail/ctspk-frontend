import { createSlice } from "@reduxjs/toolkit";

interface LoadingState {
  isLoading: boolean; // initial load (e.g., check session)
}
const initialState: LoadingState = {
  isLoading: false,
};

const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    globalLoading(state, action) {
      state.isLoading = action.payload;
    },
  },
});

export const { globalLoading } = loadingSlice.actions;
export default loadingSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InitialState<T> {
  data: T | null;
}

export const generateReducer = <T>(name: string) => {
  const initialState: InitialState<T> = { data: null };
  const slice = createSlice({
    name,
    initialState,
    reducers: {
      setData: (state, action: PayloadAction<any>) => {
        state.data = action.payload;
      },
    },
  });
  return { reducer: slice.reducer, actions: slice.actions };
};

export const setReducer = <T>(name: string) => {
  const myReducer = generateReducer<T>(name);
  const { setData } = myReducer.actions;
  return setData;
};
// how to work
//save on reducer first "name: generateReducer<[]>('name').reducer,"
// const setName = setReducer('name');
// dispatch(setName(data))

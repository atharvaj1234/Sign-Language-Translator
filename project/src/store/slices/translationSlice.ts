import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  error: null,
};

const translationSlice = createSlice({
  name: 'translation',
  initialState,
  reducers: {
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setError, clearError } = translationSlice.actions;
export default translationSlice.reducer;
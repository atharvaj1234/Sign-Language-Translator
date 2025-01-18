import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import translationReducer from './slices/translationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    translation: translationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import permissionReducer from './slices/permissionSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    permissions: permissionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

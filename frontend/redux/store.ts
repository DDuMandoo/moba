import { configureStore } from '@reduxjs/toolkit';
import accountReducer from './slices/accountSlice';
import userReducer from './slices/userSlice';
import walletReducer from './slices/walletSlice';
import permissionReducer from './slices/permissionSlice';

export const store = configureStore({
  reducer: {
    account: accountReducer,
    user: userReducer,
    wallet: walletReducer,
    permissions: permissionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
import { configureStore } from '@reduxjs/toolkit';
import accountReducer from './slices/accountSlice';
import userReducer from './slices/userSlice';
import walletReducer from './slices/walletSlice';
import permissionReducer from './slices/permissionSlice';
import chargeReducer from './slices/chargeSlice';
import transferReducer from './slices/transferSlice';
import appointmentReducer from './slices/appointmentSlice';


export const store = configureStore({
  reducer: {
    account: accountReducer,
    user: userReducer,
    wallet: walletReducer,
    permissions: permissionReducer,
    charge:chargeReducer,
    transfer:transferReducer,
    appointment:  appointmentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
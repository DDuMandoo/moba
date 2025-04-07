// redux/slices/permissionSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PermissionState {
  notification: boolean;
  location: boolean;
  gallery: boolean;
}

const initialState: PermissionState = {
  notification: false,
  location: false,
  gallery: false,
};

const permissionSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    toggleNotification: (state) => {
      state.notification = !state.notification;
    },
    toggleLocation: (state) => {
      state.location = !state.location;
    },
    setPermissions: (state, action: PayloadAction<PermissionState>) => {
      return { ...state, ...action.payload };
    }
  }
});

export const { toggleNotification, toggleLocation, setPermissions } = permissionSlice.actions;
export default permissionSlice.reducer;

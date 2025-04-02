import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/app/axiosInstance';
import * as SecureStore from 'expo-secure-store';

interface UserProfile {
  name: string;
  image: string;
  email: string;
}

interface UserState {
  currentUser: any;
  isLoggedIn: boolean;
  profile: UserProfile | null;
  isLoading: boolean;
  isError: boolean;
}

const initialState: UserState = {
  currentUser: null,
  isLoggedIn: false,
  profile: null,
  isLoading: false,
  isError: false,
};

// ✅ 유저 프로필 비동기 호출
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/members');
      console.log('✅ /members 응답:', response.data);
      return response.data.result;
    } catch (err: any) {
      console.error('❌ /members 에러:', err.response?.status, err.response?.data);
      return rejectWithValue(err.response?.data || '유저 정보 요청 실패');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<any>) => {
      state.currentUser = action.payload;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.currentUser = null;
      state.isLoggedIn = false;
      state.profile = null;

      // ✅ 로그아웃 시 토큰도 삭제
      SecureStore.deleteItemAsync('accessToken');
      SecureStore.deleteItemAsync('refreshToken');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.profile = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;

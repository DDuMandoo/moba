import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface UserProfile {
  name: string;
  image: string;
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
      const response = await axios.get('/members');
      return response.data.result; // ✅ 요기만 수정됨
    } catch (err: any) {
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

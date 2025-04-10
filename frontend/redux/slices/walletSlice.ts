// ✅ walletSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/app/axiosInstance'; // ✅

interface WalletState {
  balance: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  balance: 0,
  isLoading: false,
  error: null,
};

export const fetchWalletBalance = createAsyncThunk(
  'wallet/fetchBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/wallets');
      return response.data.result.balance;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '잔액 조회 실패');
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    resetWallet: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletBalance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action: PayloadAction<number>) => {
        state.balance = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetWallet } = walletSlice.actions;
export default walletSlice.reducer;
// redux/slices/transferSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TransferState {
  amount: number;
  selectedAccountId: string | null;
}

const initialState: TransferState = {
  amount: 0,
  selectedAccountId: null,
};

const transferSlice = createSlice({
  name: 'transfer',
  initialState,
  reducers: {
    setTransferAmount: (state, action: PayloadAction<number>) => {
      state.amount = action.payload;
    },
    selectTransferAccount: (state, action: PayloadAction<string>) => {
      state.selectedAccountId = action.payload;
    },
    resetTransferState: () => initialState,
  },
});

export const {
  setTransferAmount,
  selectTransferAccount,
  resetTransferState,
} = transferSlice.actions;

export default transferSlice.reducer;

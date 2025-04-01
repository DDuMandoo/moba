// redux/slices/chargeSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChargeState {
  amount: number;
}

const initialState: ChargeState = {
  amount: 0,
};

const chargeSlice = createSlice({
  name: 'charge',
  initialState,
  reducers: {
    setAmount: (state, action: PayloadAction<number>) => {
      state.amount = action.payload;
    },
  },
});

export const { setAmount } = chargeSlice.actions;
export default chargeSlice.reducer;

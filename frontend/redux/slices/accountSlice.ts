import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Account {
  id: string;
  type: string;
  account: string;
  isMain?: boolean;
}

interface AccountState {
  list: Account[];
  selectedAccountId: string | null;
}

const initialState: AccountState = {
  list: [],
  selectedAccountId: null,
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setAccountList: (state, action: PayloadAction<Account[]>) => {
      state.list = action.payload;
    },
    addAccount: (state, action: PayloadAction<Account>) => {
      state.list.push(action.payload);
    },
    selectAccount: (state, action: PayloadAction<string>) => {
      state.selectedAccountId = action.payload;
    },
    clearAccounts: (state) => {
      state.list = [];
      state.selectedAccountId = null;
    },
  },
});

export const { setAccountList, addAccount, selectAccount, clearAccounts } = accountSlice.actions;
export default accountSlice.reducer;
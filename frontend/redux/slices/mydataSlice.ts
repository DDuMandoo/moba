import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Subcategory {
  subcategory: string;
  score: number;
}

interface RecommendationResult {
  recommendedSubcategories: Record<string, Subcategory[]>;
  validUserIds: number[];
  invalidUserIds: number[];
}

interface MydataState {
  recommendation?: RecommendationResult;
}

const initialState: MydataState = {
  recommendation: undefined,
};

const mydataSlice = createSlice({
  name: 'mydata',
  initialState,
  reducers: {
    setRecommendation(state, action: PayloadAction<RecommendationResult>) {
      state.recommendation = action.payload;
    },
  },
});

export const { setRecommendation } = mydataSlice.actions;
export default mydataSlice.reducer;

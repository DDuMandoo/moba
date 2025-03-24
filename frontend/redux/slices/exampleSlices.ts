import { createSlice } from '@reduxjs/toolkit'

const exampleSlice = createSlice({
  name: 'example',
  initialState: {
    count: 0,
  },
  reducers: {
    increment: (state) => {
      state.count += 1
    },
  },
})

export const { increment } = exampleSlice.actions
export default exampleSlice.reducer

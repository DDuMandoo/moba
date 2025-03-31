import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface AppointmentResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    appointmentId: number;
    name: string;
    imageUrl?: string;
    time: string;
    latitude?: number;
    longitude?: number;
    memo?: string;
    inviteCode: string;
    isEnded: boolean;
    createdAt: string;
  };
}

interface AppointmentState {
  loading: boolean;
  error: string | null;
  createdAppointment: AppointmentResponse | null;
}

const initialState: AppointmentState = {
  loading: false,
  error: null,
  createdAppointment: null,
};

export const createAppointment = createAsyncThunk<
  AppointmentResponse,
  FormData,
  { rejectValue: string }
>('appointment/create', async (formData, { rejectWithValue }) => {
  try {
    const res = await axios.post('/appointments', formData); // ✅ headers X
    return res.data as AppointmentResponse;
  } catch (err: any) {
    console.log('❌ 약속 생성 실패:', err.response?.data);
    return rejectWithValue(err.response?.data?.message || '약속 생성 실패');
  }
});

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    resetAppointmentState: (state) => {
      state.createdAppointment = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.createdAppointment = action.payload;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? '알 수 없는 오류';
      });
  },
});

export const { resetAppointmentState } = appointmentSlice.actions;
export default appointmentSlice.reducer;

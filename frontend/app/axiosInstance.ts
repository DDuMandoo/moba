// ✅ app/axiosInstance.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

// const API_URL = Constants.expoConfig?.extra?.API_URL;
const API_URL = process.env.EXPO_PUBLIC_API_URL;


console.log('🌐 API_URL from Constants:', API_URL);

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export const saveTokens = async (accessToken: string, refreshToken: string) => {
  await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
};

export const getAccessToken = async () => {
  return await SecureStore.getItemAsync(ACCESS_KEY);
};

export const getRefreshToken = async () => {
  return await SecureStore.getItemAsync(REFRESH_KEY);
};

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
};

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ 요청 시 Access Token 자동 첨부
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 응답에서 4203이면 Refresh 시도
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${API_URL}/auth/reissuance`, {}, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
            'Content-Type': 'application/json'
          }
        });

        const { accessToken, refreshToken: newRefreshToken } = res.data.result;
        await saveTokens(accessToken, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (err: any) {
        const code = err?.response?.data?.code;
        const message = err?.response?.data?.message;

        if (code === 4203 ) {
          console.error('🔴 리프레시 토큰 만료됨 → 로그인 이동');
          await clearTokens();
          router.replace('/');
        } else {
          console.error('🔴 토큰 갱신 중 에러', err);
        }

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

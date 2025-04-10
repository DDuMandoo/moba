import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import axiosInstance from '@/app/axiosInstance';
import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';

interface MyData {
  [key: string]: any;
}

const fetchMydata = async (): Promise<MyData> => {
  const response = await axiosInstance.get('/mydatas');
  const result = response.data?.result;

  const isNotConnected = response.data?.code === 3001;

  if (!result || isNotConnected) {
    return { isConnected: false };
  }

  return {
    isConnected: true,
    ...result,
  };
};

export const useMydata = () => {
  const router = useRouter();
  const hasShownAlert = useRef(false);

  const query = useQuery<MyData, Error>({
    queryKey: ['mydata'],
    queryFn: fetchMydata,
    staleTime: 1000 * 60 * 3,
    retry: false,
  });

  // ✅ 성공 로깅
  useEffect(() => {
    if (query.data) {
      console.log('📦 useMydata success:', query.data);
    }
  }, [query.data]);

  // ✅ 에러 로깅 + 토큰 오류 처리
  useEffect(() => {
    if (query.error) {
      const error: any = query.error;
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;

      console.log('❌ useMydata error:', {
        status,
        message,
        code: error?.response?.data?.code,
        data: error?.response?.data,
      });

      const isTokenError =
        status === 401 ||
        message?.includes('토큰') ||
        message === 'access_token_missing';

      if (isTokenError && !hasShownAlert.current) {
        hasShownAlert.current = true;
        Alert.alert('마이데이터 연결 필요', '마이데이터 인증이 되어 있지 않습니다.', [
          {
            text: '인증하러 가기',
            onPress: () => {
              router.replace('/wallet/analysis/consent');
            },
          },
        ]);
      }
    }
  }, [query.error]);

  return query;
};

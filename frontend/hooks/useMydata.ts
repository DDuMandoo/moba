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
  const result = response.data.result;

  const isNotConnected = response.data.code === 3001; // 예: 마이데이터 미연동

  if (isNotConnected) {
    // ❗ 에러를 throw하지 말고 상태로 넘기자
    return { isConnected: false };
  }

  return { isConnected: true, ...result };
};

export const useMydata = () => {
  const router = useRouter();
  const hasShownAlert = useRef(false); // ✅ Alert 중복 방지용 ref


  const query = useQuery<MyData, Error>({
    queryKey: ['mydata'],
    queryFn: fetchMydata,
    staleTime: 1000 * 60 * 3,
    retry: false,
  });

  useEffect(() => {
    if (query.error) {
      const error: any = query.error;
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;
  
      console.log('🧪 MyData 요청 에러 응답:', {
        status,
        message,
        full: error.response?.data,
      });
  
      const isTokenError =
        status === 401 ||
        message?.includes('토큰') ||
        message === 'access_token_missing';
  
      if (isTokenError) {
        hasShownAlert.current = true; // ✅ 한 번만 실행
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

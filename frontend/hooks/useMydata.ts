import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import axiosInstance from '@/app/axiosInstance';
import { useEffect } from 'react';
import { Alert } from 'react-native';

interface MyData {
  [key: string]: any;
}

const fetchMydata = async (): Promise<MyData> => {
  const response = await axiosInstance.get('/mydatas');
  const tokenFromServer = response.data.access_token;
  const result = response.data.result;

  if (!tokenFromServer) {
    throw new Error('access_token_missing');
  }

  return result;
};

export const useMydata = () => {
  const router = useRouter();

  const query = useQuery<MyData, Error>({
    queryKey: ['mydata'],
    queryFn: fetchMydata,
    staleTime: 1000 * 60 * 3,
    retry: 1,
  });

  useEffect(() => {
    if (query.error) {
      const error: any = query.error;
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;

      const isTokenError =
        status === 401 || message?.includes('토큰') || message === 'access_token_missing';

      if (isTokenError) {
        Alert.alert('인증 필요', '마이데이터 연결이 필요합니다.', [
          {
            text: '이동',
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

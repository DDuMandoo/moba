import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/axiosInstance';

const fetchMydata = async () => {
  const response = await axiosInstance.post('/mydatas');
  return response.data.result;
};

export const useMydata = () => {
  return useQuery({
    queryKey: ['mydata'],
    queryFn: fetchMydata,
    staleTime: 1000 * 60 * 3,
    retry: 1,
  });
};

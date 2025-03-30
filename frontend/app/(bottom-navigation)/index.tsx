import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  ActivityIndicator,
} from 'react-native';
import WalletStatus from '@/components/WalletStatus';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/axiosInstance';
import Colors from '@/constants/Colors';

interface UserProfile {
  name: string;
  image: string;
}

const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await axiosInstance.get('/api/members');
  return response.data;
};

export default function WalletDetailPage() {
  const { data, isLoading, isError } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  });

  return (
    <ScrollView className="bg-gray-50" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24 }}>

  {/* 프로필 영역 */}
  {isLoading ? (
    <ActivityIndicator color={Colors.primary} />
  ) : !data || isError ? (
    <Text className="text-base font-bold text-gray-800">유저 정보를 불러올 수 없습니다.</Text>
  ) : (
    <View className="flex-row items-center space-x-3 self-start mb-4">
      <Image
        source={{ uri: data.image }}
        className="w-14 h-14 rounded-full bg-gray-200"
      />
      <Text className="text-lg text-gray-900 font-bold">{data.name} 님의 지갑</Text>
    </View>
  )}

  {/* ✅ WalletStatus 중앙 정렬 */}
  <View className="items-center w-full">
    <WalletStatus />
  </View>
</ScrollView>

  );
}

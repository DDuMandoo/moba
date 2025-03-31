import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import WalletStatus from '@/components/WalletStatus';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

interface UserProfile {
  name: string;
  image: string;
}

const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await axios.get('/api/members');
  return response.data;
};

export default function WalletDetailPage() {
  const router = useRouter();

  const { data, isLoading, isError } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  });

  return (
    <ScrollView className="bg-gray-50 px-5 pt-6 pb-10 space-y-6">
      {/* 프로필 영역 */}
      {isLoading ? (
        <ActivityIndicator color={Colors.primary} />
      ) : !data || isError ? (
        <Text className="text-base font-bold text-gray-800">유저 정보를 불러올 수 없습니다.</Text>
      ) : (
        <View className="flex-row items-center space-x-3">
          <Image source={{ uri: data.image }} className="w-14 h-14 rounded-full bg-gray-200" />
          <Text className="text-lg text-gray-900 font-bold">{data.name} 님의 지갑</Text>
        </View>
      )}

      {/* 지갑 상태 */}
      <View className="items-center w-full">
        <WalletStatus />
      </View>

      {/* 기능 버튼 3개 */}
      <View className="flex-row justify-between gap-3">
        <FeatureButton
          icon={<MaterialCommunityIcons name="bank-transfer" size={24} color={Colors.primary} />}
          label="송금"
          onPress={() => router.push('/wallet/transfer')}
        />
        <FeatureButton
          icon={<Ionicons name="list-outline" size={22} color={Colors.primary} />}
          label="세부내역"
          onPress={() => router.push('/wallet/history')}
        />
        <FeatureButton
          icon={<MaterialCommunityIcons name="bank-outline" size={22} color={Colors.primary} />}
          label="계좌 관리"
          onPress={() => router.push('/wallet/account')}
        />
      </View>

      {/* 소비 분석 카드 영역 */}
      <View className="bg-white rounded-xl p-5 shadow-sm">
        <Text className="text-base font-bold text-gray-900">약속 소비 패턴 분석</Text>
        {/* 추후 내용 들어갈 예정 */}
      </View>

      <View className="bg-white rounded-xl p-5 shadow-sm">
        <Text className="text-base font-bold text-gray-900">내 소비 패턴 분석</Text>
        {/* 추후 내용 들어갈 예정 */}
      </View>
    </ScrollView>
  );
}

interface FeatureButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

const FeatureButton = ({ icon, label, onPress }: FeatureButtonProps) => (
  <View className="flex-1">
    <View
      onTouchEnd={onPress}
      className="items-center border border-[#593C1C] rounded-xl py-3 bg-white"
    >
      {icon}
      <Text className="text-[#593C1C] font-bold mt-1">{label}</Text>
    </View>
  </View>
);

import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import WalletStatus from '@/components/WalletStatus';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

interface UserProfile {
  name: string;
  image: string;
}

const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await axios.get('/members');
  return response.data;
};

export default function WalletDetailPage() {
  const router = useRouter();

  const { data, isLoading, isError } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  });

  const renderProfile = () => {
    if (isLoading) {
      return <ActivityIndicator color={Colors.primary} />;
    }

    if (isError || !data) {
      return (
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.grayDarkText }}>
          유저 정보를 불러올 수 없습니다.
        </Text>
      );
    }

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Image
          source={{ uri: data.image }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: Colors.grayLightText,
          }}
        />
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text }}>
          {data.name} 님의 지갑
        </Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={{ backgroundColor: Colors.background }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
    >
      {/* 프로필 영역 */}
      {renderProfile()}

      {/* 지갑 상태 */}
      <View style={{ alignItems: 'center', width: '100%', marginTop: 24 }}>
        <WalletStatus />
      </View>

      {/* 기능 버튼 3개 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
        <FeatureButton
          iconName="send"
          label="송금"
          onPress={() => router.push('/wallet/transfer')}
        />
        <FeatureButton
          iconName="list"
          label="세부내역"
          onPress={() => router.push('/wallet/history')}
        />
        <FeatureButton
          iconName="credit-card"
          label="계좌 관리"
          onPress={() => router.push('/wallet/account')}
        />
      </View>

      {/* 분석 카드 영역 */}
      <View
        style={{
          backgroundColor: Colors.white,
          borderRadius: 16,
          padding: 20,
          marginTop: 24,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text }}>
          약속 소비 패턴 분석
        </Text>
      </View>

      <View
        style={{
          backgroundColor: Colors.white,
          borderRadius: 16,
          padding: 20,
          marginTop: 16,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text }}>
          내 소비 패턴 분석
        </Text>
      </View>
    </ScrollView>
  );
}

interface FeatureButtonProps {
  iconName: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}

const FeatureButton = ({ iconName, label, onPress }: FeatureButtonProps) => {
  const { width: screenWidth } = useWindowDimensions();

  const width = screenWidth * 0.29;
  const height = 40;
  const borderRadius = 12;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width,
        height,
        backgroundColor: Colors.background,
        borderColor: Colors.primary,
        borderWidth: 1,
        borderRadius,
        paddingHorizontal: 8,
      }}
    >
      <Feather
        name={iconName}
        size={16}
        color={Colors.primary}
        style={{ marginRight: 6 }}
      />
      <Text
        style={{
          color: Colors.primary,
          fontWeight: 'bold',
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

import React, { useEffect } from 'react';
import {
  ScrollView,
  View,
  useWindowDimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchUserProfile } from '@/redux/slices/userSlice';
import WalletStatus from '@/components/WalletStatus';
import ProfileHeader from '@/components/profile/ProfileHeader';
import Colors from '@/constants/Colors';

interface FeatureButtonProps {
  iconName: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}

const FeatureButton = ({ iconName, label, onPress }: FeatureButtonProps) => {
  const { width: screenWidth } = useWindowDimensions();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: screenWidth * 0.29,
        height: 40,
        backgroundColor: Colors.background,
        borderColor: Colors.primary,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 8,
      }}
    >
      <Feather
        name={iconName}
        size={16}
        color={Colors.primary}
        style={{ marginRight: 6 }}
      />
      <Text style={{ color: Colors.primary, fontWeight: 'bold', fontSize: 13 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default function WalletDetailPage() {
  const dispatch = useAppDispatch();
  const { profile, isLoading, isError } = useAppSelector((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, []);

  return (
    <ScrollView
      style={{ backgroundColor: Colors.background }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
    >
      {/* ✅ 프로필 */}
      <ProfileHeader
        name={profile?.name || ''}
        image={profile?.image || ''}
        isLoading={isLoading}
        isError={isError}
      />

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
      <View style={{
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        marginTop: 24,
      }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text }}>
          약속 소비 패턴 분석
        </Text>
      </View>

      <View style={{
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
      }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text }}>
          내 소비 패턴 분석
        </Text>
      </View>
    </ScrollView>
  );
}

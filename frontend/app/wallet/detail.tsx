import React, { useEffect } from 'react';
import { useMydata } from '@/hooks/useMydata';
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
import SpendingPatternAnalysis from '@/components/wallet/SpendingPatternAnalysis';

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
  console.log('🔥 WalletDetailPage 최소 진입 성공');

  const dispatch = useAppDispatch();
  const { profile, isLoading: profileLoading, isError } = useAppSelector((state) => state.user);
  const router = useRouter();

  const { data, isLoading: mydataLoading, isError: mydataError, error } = useMydata();

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, []);

  console.log('✅ WalletDetailPage 진입');
  console.log('📊 useMydata() 실행됨');
  if (error) {
    console.error('❌ useMydata 에러:', error);
  }

  return (
    <ScrollView
      style={{ backgroundColor: Colors.background }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
    >
      {/* ✅ 프로필 */}
      <ProfileHeader
        name={profile?.name || ''}
        image={profile?.image || ''}
        isLoading={profileLoading}
        isError={isError}
        titleFormat={(name) => `${name}의 지갑`}
      />

      {/* 지갑 상태 */}
      <View style={{ alignItems: 'center', width: '100%', marginTop: 24 }}>
        <WalletStatus />
      </View>

      {/* 기능 버튼 3개 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
        <FeatureButton iconName="send" label="송금" onPress={() => router.push('/wallet/transfer')} />
        <FeatureButton iconName="list" label="세부내역" onPress={() => router.push('/wallet/history')} />
        <FeatureButton iconName="credit-card" label="계좌 보기" onPress={() => router.push('/wallet/account')} />
      </View>

      {/* 분석 카드 */}
      <View style={{
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
      }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text }}>
          약속 소비 패턴 분석
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 12,
            backgroundColor: Colors.primary,
            paddingVertical: 12,
            borderRadius: 12,
            alignItems: 'center',
          }}
          onPress={() => router.push('/wallet/analysis/consent')}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            소비 분석 시작하기
          </Text>
        </TouchableOpacity>
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

        {mydataLoading && <Text style={{ marginTop: 12 }}>불러오는 중...</Text>}
        {mydataError && (
          <Text style={{ marginTop: 12, color: 'red' }}>
            데이터 불러오기 실패: {(error as any)?.message ?? '알 수 없는 에러'}
          </Text>
        )}
        {data && (
          <SpendingPatternAnalysis
            hourlyStats={data.hourly_stats}
            categoryRatio={data.category_ratio}
          />
        )}
      </View>
    </ScrollView>
  );
}

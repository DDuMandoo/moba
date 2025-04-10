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
import HourlySpendingChart from '@/components/chart/HourlySpendingChart';
import BubbleChart from '@/components/chart/BubbleChart';

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
  const { profile, isLoading: profileLoading, isError } = useAppSelector(
    (state) => state.user
  );
  const router = useRouter();

  const {
    data,
    isLoading: mydataLoading,
    isError: mydataError,
    error,
  } = useMydata();

  useEffect(() => {
    if (data?.isConnected) {
      console.log('✅ MyData 연결 성공');
      console.log('📊 personaSummary:', data.mydataBase?.personaSummary);
      console.log('📈 hourlyStats:', data.mydataBase?.hourlyStats);
      console.log('🫧 categoryPriceRatio:', data.mydataBase?.categoryPriceRatio);
    }
  }, [data]);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, []);

  const isMydataAuthError = (error as any)?.response?.data?.code === 4900;

  const hourlyStats = data?.mydataBase?.hourlyStats ?? {};
  const categoryPriceRatio = data?.mydataBase?.categoryPriceRatio ?? {};
  const personaSummary = data?.mydataBase?.personaSummary ?? '';

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
        titleFormat={(name) => `${name}님의 지갑`}
      />

      {/* ✅ 지갑 상태 */}
      <View style={{ alignItems: 'center', width: '100%', marginTop: 24 }}>
        <WalletStatus />
      </View>

      {/* ✅ 기능 버튼 */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 24,
        }}
      >
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
          label="계좌 보기"
          onPress={() => router.push('/wallet/account')}
        />
      </View>

      {/* ✅ 내 소비 패턴 분석 */}
      <View
        style={{
          backgroundColor: Colors.white,
          borderRadius: 16,
          padding: 20,
          marginTop: 20,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text }}>
          내 소비 패턴 분석
        </Text>

        {/* 🔄 로딩 중 */}
        {mydataLoading && (
          <Text style={{ marginTop: 12 }}>불러오는 중...</Text>
        )}

        {/* 🔒 마이데이터 연결 안 된 상태 (code: 4900) */}
        {isMydataAuthError && (
          <View
            style={{
              marginTop: 12,
              paddingVertical: 16,
              borderRadius: 8,
              backgroundColor: '#F0F0F0',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Feather
              name="lock"
              size={18}
              color="#999"
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: '#999', fontWeight: 'bold' }}>
              마이데이터 인증 후 분석 결과를 확인할 수 있어요
            </Text>
          </View>
        )}

        {/* ❌ 기타 오류 */}
        {mydataError && !isMydataAuthError && (
          <Text style={{ marginTop: 12, color: 'red' }}>
            데이터 불러오기 실패:{' '}
            {(error as any)?.message ?? '알 수 없는 에러'}
          </Text>
        )}

        {/* ✅ 분석 데이터 렌더링 */}
        {data?.isConnected &&
          hourlyStats &&
          categoryPriceRatio &&
          Object.keys(hourlyStats).length > 0 && (
            <>
              <Text style={{ marginTop: 12, fontSize: 14, color: Colors.text }}>
                {personaSummary}
              </Text>

              <HourlySpendingChart
                data={Object.entries(hourlyStats).map(([hour, amount]) => ({
                  hour: Number(hour),
                  amount: Number(amount),
                }))}
              />

              <BubbleChart
                center={{ category: '소비 분석' }}
                subs={Object.entries(categoryPriceRatio)
                  .map(([category, subMap]) => {
                    const total = Object.values(subMap as Record<string, number>)
                      .reduce((sum, val) => sum + val, 0);
                    return { category, ratio: total };
                  })
                  .filter((item) => item.ratio > 0)}
              />
            </>
          )}
      </View>
    </ScrollView>
  );
}

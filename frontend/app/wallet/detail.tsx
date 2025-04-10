import React, { useEffect, useState } from 'react';
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
import { useMydata } from '@/hooks/useMydata';

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
    dispatch(fetchUserProfile());
  }, []);

  const isMydataAuthError = (error as any)?.response?.data?.code === 4900;

  const hourlyStats = data?.mydataBase?.hourlyStats ?? {};
  const categoryPriceRatio = data?.mydataBase?.categoryPriceRatio ?? {};
  const personaSummary = data?.mydataBase?.personaSummary ?? '';

  useEffect(() => {
    if (!mydataLoading && data?.isConnected) {
      console.log('✅ MyData 연결 성공');
      console.log('📦 categoryPriceRatio:', categoryPriceRatio);
      console.log('📊 personaSummary:', personaSummary);
      console.log('📈 hourlyStats:', hourlyStats);
    }
  }, [data, mydataLoading]);

  const isValidMydata =
    !mydataLoading &&
    data?.isConnected &&
    !isMydataAuthError &&
    !!data?.mydataBase &&
    Object.keys(hourlyStats).length > 0;

  const TAB_CATEGORIES = ['음식점', '카페', '주점', '문화/여가', '운동'];

  const CATEGORY_MAP: Record<string, string> = {
    음식점: '음식',
    카페: '카페,디저트',
    주점: '술집',
    '문화/여가': '문화,여가',
    운동: '운동',
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('음식점');

  return (
    <ScrollView
      style={{ backgroundColor: Colors.background }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
    >
      <ProfileHeader
        name={profile?.name || ''}
        image={profile?.image || ''}
        isLoading={profileLoading}
        isError={isError}
        titleFormat={(name) => `${name}님의 지갑`}
      />

      <View style={{ alignItems: 'center', width: '100%', marginTop: 0 }}>
        <WalletStatus />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <FeatureButton iconName="send" label="송금" onPress={() => router.push('/wallet/transfer')} />
        <FeatureButton iconName="list" label="세부내역" onPress={() => router.push('/wallet/history')} />
        <FeatureButton iconName="credit-card" label="계좌 보기" onPress={() => router.push('/wallet/account')} />
      </View>

      <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: 20, marginTop: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text }}>내 소비 패턴 분석</Text>

        {mydataLoading && <Text style={{ marginTop: 12 }}>불러오는 중...</Text>}

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
            <Feather name="lock" size={18} color="#999" style={{ marginRight: 8 }} />
            <Text style={{ color: '#999', fontWeight: 'bold' }}>
              마이데이터 인증 후 분석 결과를 확인할 수 있어요
            </Text>
          </View>
        )}

        {mydataError && !isMydataAuthError && (
          <Text style={{ marginTop: 12, color: 'red' }}>
            데이터 불러오기 실패: {(error as any)?.message ?? '알 수 없는 에러'}
          </Text>
        )}

        {isValidMydata && (
          <>
            <View
              style={{
                backgroundColor: '#FFF8F0',
                padding: 16,
                borderRadius: 16,
                marginTop: 16,
                borderColor: '#FFDDC1',
                borderWidth: 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 8, color: '#FF9900' }}>
                🔍 나의 소비 성향
              </Text>
              <Text style={{ fontSize: 14, color: Colors.text, lineHeight: 22 }}>
                {personaSummary}
              </Text>
            </View>

            {(() => {
              const spendingData = Object.entries(hourlyStats).map(([hour, amount]) => ({
                hour: Number(hour),
                amount: Number(amount),
              }));

              const amounts = spendingData.map((d) => d.amount);
              const maxAmount = Math.max(...amounts);
              const yMax = Math.ceil(maxAmount / 10000) * 10000;

              return <HourlySpendingChart data={spendingData} yMin={0} yMax={yMax} yStep={10000} />;
            })()}

            <View style={{ marginTop: 32 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 12 }}>
                💬 카테고리별 소비 분석
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {TAB_CATEGORIES.map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setSelectedCategory(tab)}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 14,
                      marginRight: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: selectedCategory === tab ? Colors.primary : '#ddd',
                      backgroundColor: selectedCategory === tab ? Colors.primary : '#fff',
                    }}
                  >
                    <Text
                      style={{
                        color: selectedCategory === tab ? '#fff' : Colors.text,
                        fontWeight: '500',
                      }}
                    >
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {(() => {
                const categoryKey = CATEGORY_MAP[selectedCategory];
                const subMap = categoryPriceRatio[categoryKey];

                if (!subMap) {
                  return (
                    <Text style={{ color: '#999', textAlign: 'center', marginTop: 20 }}>
                      해당 카테고리에 대한 소비 내역이 없어요 😥
                    </Text>
                  );
                }

                const numericValues = Object.values(subMap).map(Number);
                const maxRatio = Math.max(...numericValues);

                const subs = Object.entries(subMap).map(([subCategory, amount]) => ({
                  category: subCategory,
                  ratio: Number(amount),
                  size: 10 + Math.pow(Number(amount) / maxRatio, 0.5) * 30,
                }));

                return (
                  <View style={{ marginBottom: 32 }}>
                    <BubbleChart center={{ category: selectedCategory }} subs={subs} />
                  </View>
                );
              })()}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

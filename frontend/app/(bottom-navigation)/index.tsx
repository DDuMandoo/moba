import React, { useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  ActivityIndicator,
} from 'react-native';
import WalletStatus from '@/components/WalletStatus';
import Colors from '@/constants/Colors';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchUserProfile } from '@/redux/slices/userSlice';
import ProfileHeader from '@/components/profile/ProfileHeader';


export default function WalletDetailPage() {
  const dispatch = useAppDispatch();
  const { profile, isLoading, isError } = useAppSelector((state) => state.user);

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

      {/* 분석 카드 영역 */}
      <View style={{
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        marginTop: 24,
      }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text }}>
          내 약속
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

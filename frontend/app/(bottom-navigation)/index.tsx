import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchUserProfile } from '@/redux/slices/userSlice';
import WalletStatus from '@/components/WalletStatus';
import ProfileHeader from '@/components/ProfileHeader';
import Colors from '@/constants/Colors';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { profile, isLoading, isError } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, []);

  return (
    <ScrollView
      style={{ backgroundColor: Colors.grayBackground }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24 }}
    >
      <ProfileHeader
        name={profile?.name || ''}
        image={profile?.image || ''}
        isLoading={isLoading}
        isError={isError}
      />

      {/* ✅ WalletStatus 중앙 정렬 */}
      <View style={{ alignItems: 'center', width: '100%' }}>
        <WalletStatus />
      </View>
    </ScrollView>
  );
}

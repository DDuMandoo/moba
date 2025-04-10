import React, { useEffect } from 'react';
import { ScrollView, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import WalletStatus from '@/components/WalletStatus';
import Colors from '@/constants/Colors';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchUserProfile } from '@/redux/slices/userSlice';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AppointmentCalendarSection from '@/components/promises/AppointmentCalenderSection';

export default function WalletDetailPage() {
  const dispatch = useAppDispatch();
  const { profile, isLoading, isError } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, []);

  if (isLoading || !profile?.email) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ProfileHeader
        name={profile.name}
        image={profile.image}
        isLoading={isLoading}
        isError={isError}
      />

      <View style={styles.walletStatusWrapper}>
        <WalletStatus />
      </View>

      <AppointmentCalendarSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.text,
  },
  walletStatusWrapper: {
    alignItems: 'center',
    width: '100%',
    marginTop: 0,
  },
});

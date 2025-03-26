import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  ActivityIndicator,
} from 'react-native';
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';
import WalletStatus from '@/components/WalletStatus';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface UserProfile {
  name: string;
  image: string;
}

const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await axios.get('/api/members');
  return response.data;
};

export default function HomeScreen() {
  const { data, isLoading, isError } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 프로필 영역 */}
      {isLoading ? (
        <ActivityIndicator color={Colors.primary} />
      ) : !data || isError ? (
        <Text style={styles.name}>유저 정보를 불러올 수 없습니다.</Text>
      ) : (
        <View style={styles.profileSection}>
          <Image
            source={{ uri: data.image }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{data.name}</Text>
        </View>
      )}

      {/* 지갑 컴포넌트 */}
      <WalletStatus />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.background,
    gap: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.grayBackground, // 로딩 중 빈 배경
  },
  name: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
});

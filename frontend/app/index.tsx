// 📂app/index.tsx
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { getAccessToken } from './axiosInstance';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      const token = await getAccessToken();
      if (token) {
        router.replace('/(bottom-navigation)');
      } else {
        router.replace('/auth/login');
      }
    };

    checkToken();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

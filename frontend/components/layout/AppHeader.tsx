// components/layout/AppHeader.tsx
import { useRouter } from 'expo-router';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useNavigationState } from '@react-navigation/native';

export default function AppHeader() {
  const router = useRouter();
  const canGoBack = useNavigationState((state) => state?.routes?.length > 1);

  return (
    <View style={styles.header}>
      {canGoBack ? (
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={Colors.secondary} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}

      <Image
        source={require('@/assets/icons/header/Logo.png')}
        style={styles.logo}
      />

      <TouchableOpacity onPress={() => console.log('알림')}>
        <Feather name="bell" size={24} color={Colors.secondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    marginBottom: 2,
  },
});

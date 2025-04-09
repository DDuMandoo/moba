// components/layout/BottomTabs.tsx
import { usePathname, useRouter } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

const tabItems = [
  { name: '홈', icon: 'home', route: '/(bottom-navigation)' as const },
  { name: '추가', icon: 'plus-circle', route: '/add' as const },
  { name: '프로필', icon: 'user', route: '/profile' as const },
] as const;

export default function BottomTabs() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.tabBar}>
      {tabItems.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          onPress={() => router.push(tab.route)}
          style={styles.tabItem}
        >
          <Feather
            name={tab.icon}
            size={24}
            color={pathname === tab.route ? Colors.primary : Colors.secondary}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 50,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grayBackground,
    flexDirection: 'row',
    justifyContent: 'space-around', // ← 통일 포인트
    alignItems: 'center',
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },  
});

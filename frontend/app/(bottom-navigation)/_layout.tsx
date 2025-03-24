import { Tabs, useRouter } from 'expo-router';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function BottomTabLayout() {
  const router = useRouter();

  return (
    <>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#5B3A29" />
        </TouchableOpacity>

        <Image
          source={require('@/assets/icons/header/Logo.png')}
          style={styles.logo}
        />

        <TouchableOpacity onPress={() => console.log('알림')}>
          <Feather name="bell" size={24} color="#5B3A29" />
        </TouchableOpacity>
      </View>

      {/* 탭 네비게이션 */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 70,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#eee',
          },
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarIconStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 15,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: '홈',
            tabBarIcon: ({ focused }) => (
              <Feather
                name="home"
                size={28}
                color={focused ? '#3B1E0F' : '#5B3A29'}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: '추가',
            tabBarIcon: ({ focused }) => (
              <Feather
                name="plus-circle"
                size={28}
                color={focused ? '#3B1E0F' : '#5B3A29'}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: '프로필',
            tabBarIcon: ({ focused }) => (
              <Feather
                name="user"
                size={26}
                color={focused ? '#3B1E0F' : '#5B3A29'}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: '#fff',
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

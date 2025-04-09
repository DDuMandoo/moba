// 📂 app/(bottom-navigation)/_layout.tsx
import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useNavigationState, NavigationState } from '@react-navigation/native';
import NotificationDrawer from '@/components/notification/NotificationDrawer';

export default function BottomTabLayout() {
  const router = useRouter();
  const canGoBack = useNavigationState((state: NavigationState) => state?.routes?.length > 1);
  const [open, setOpen] = useState(false); // 알림바 상태

  return (
    <>
      <NotificationDrawer visible={open} onClose={() => setOpen(false)} />

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

        <TouchableOpacity onPress={() => setOpen(true)}>
          <Feather name="bell" size={24} color={Colors.secondary} />
        </TouchableOpacity>
      </View>

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 70,
            backgroundColor: Colors.white,
            borderTopWidth: 1,
            borderTopColor: Colors.grayBackground,
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
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <Feather
                name="home"
                size={28}
                color={focused ? Colors.primary : Colors.secondary}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: '추가',
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <Feather
                name="plus-circle"
                size={28}
                color={focused ? Colors.primary : Colors.secondary}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: '프로필',
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <Feather
                name="user"
                size={26}
                color={focused ? Colors.primary : Colors.secondary}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="wallet"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="promises"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </>
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

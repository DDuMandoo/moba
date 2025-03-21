// app/(tabs)/_layout.tsx
import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';

interface TabsLayoutProps {
  children: ReactNode;
}

const TabsLayout: React.FC<TabsLayoutProps> = ({ children }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        {/* Home 탭 */}
        <Link href="/" style={{ marginHorizontal: 10 }}>
          <Text>홈</Text>
        </Link>
        {/* Explore 탭 */}
        <Link href="/explore" style={{ marginHorizontal: 10 }}>
          <Text>예시</Text>
        </Link>
      </View>

      {/* 탭에 해당하는 내용 */}
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </View>
  );
};

export default TabsLayout;

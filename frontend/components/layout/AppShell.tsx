// components/layout/AppShell.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppHeader from '@/components/layout/AppHeader';
import BottomTabs from '@/components/layout/BottomTabs';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.content}>{children}</View>
      <BottomTabs />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
  },
});

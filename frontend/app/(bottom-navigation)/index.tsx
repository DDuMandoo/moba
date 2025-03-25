// 📂app/(bottom-navigation)/index.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import RoundedButton from '@/components/ui/RoundedButton';

export default function HomeScreen() {
  const router = useRouter();

  const goToLogin = () => {
    router.push('/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🏠 Home Page</Text>

      {/* 버튼 1 */}
      <RoundedButton
        title="버튼1 - Large + FullWidth"
        size="lg"
        fullWidth
        onPress={goToLogin}
      />

      {/* 버튼 2 */}
      <RoundedButton
        title="버튼2 - Medium, width: 300"
        size="md"
        style={{ width: 300 }}
        onPress={() => {}}
      />

      {/* 버튼 3 */}
      <RoundedButton
        title="버튼3 - Small, width: 270"
        size="sm"
        style={{ width: 270 }}
        onPress={() => {}}
      />

      {/* 버튼 4 */}
      <RoundedButton
        title="버튼4 - XS, width: 140"
        size="xs"
        style={{ width: 140 }}
        onPress={() => {}}
      />

      {/* 버튼 5 */}
      <RoundedButton
        title="버튼5 - Small, width: 80"
        size="sm"
        style={{ width: 80 }}
        onPress={() => {}}
      />

      {/* 버튼 6 */}
      <RoundedButton
        title="버튼6 - Medium, width: 250"
        size="md"
        style={{ width: 250 }}
        onPress={() => {}}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f3f2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 20,
    color: '#3B1E0F',
    marginBottom: 20,
  },
});

// 📂app/(bottom-navigation)/index.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button'; // ✅ Button 객체 import

export default function HomeScreen() {
  const router = useRouter();

  const goToLogin = () => {
    router.push('/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🏠 Home Page</Text>

      <Button.Large title="버튼1 - Large" onPress={goToLogin} />
      <Button.Medium title="버튼2 - Medium" onPress={() => {}} />
      <Button.MidSmall title="버튼3 - MidSmall" onPress={() => {}} />
      <Button.Small title="버튼4 - Small" onPress={() => {}} />
      <Button.Mini title="버튼5 - Mini" onPress={() => {}} />
      <Button.Tiny title="확인" onPress={() => {}} />
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

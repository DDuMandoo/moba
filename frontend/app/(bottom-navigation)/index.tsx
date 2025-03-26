// app/(bottom-navigation)/index.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MainPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>메인 페이지</Text>
      {/* 여기에 하단 탭 네비게이션이나 다른 컨텐츠 추가 */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
  },
});

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

export default function ResultBoard({
    scores,
    playerNames,
    onRestart,
  }: {
    scores: number[][];
    playerNames: string[];   // ✅ 추가
    onRestart: () => void;
  }) {
    const results = scores.map((playerScores, idx) => ({
      player: playerNames[idx], // ✅ 이름 표시
      total: playerScores.reduce((a, b) => a + b, 0),
    })).sort((a, b) => b.total - a.total);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 최종 순위</Text>
      {results.map((r, idx) => (
        <View key={r.player} style={styles.card}>
          <Text style={styles.rank}>{idx + 1}위</Text>
          <Text style={{ color: Colors.text }}>{r.player}번 참가자 - {r.total}점</Text>
        </View>
      ))}
      <Button title="다시 시작하기" onPress={onRestart} color={Colors.secondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.primary },
  card: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    width: 220,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.secondary,
  },
});

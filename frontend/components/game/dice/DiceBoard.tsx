import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import Dice from './Dice';
import Colors from '@/constants/Colors';

export default function DiceBoard({
    playerNames,
    rounds,
    onFinish,
  }: {
    playerNames: string[];
    rounds: number;
    onFinish: (scores: number[][]) => void;
  }) {
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [scores, setScores] = useState<number[][]>(
    Array.from({ length: playerNames.length }, () => [])
  );
  const [dice, setDice] = useState<[number, number] | null>(null);

  const handleRoll = () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setDice(null);

    setTimeout(() => {
      setDice([d1, d2]);

      setScores((prev) => {
        const copy = [...prev];
        copy[currentPlayer] = [...copy[currentPlayer], d1 + d2];
        return copy;
      });

      const isLastPlayer = currentPlayer === playerNames.length - 1;
      const isLastRound = currentRound === rounds;

      if (isLastPlayer && isLastRound) {
        onFinish(scores.map((s, i) => i === currentPlayer ? [...s, d1 + d2] : s));
      } else if (isLastPlayer) {
        setCurrentRound((r) => r + 1);
        setCurrentPlayer(0);
      } else {
        setCurrentPlayer((p) => p + 1);
      }
    }, 400);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.turnText}>
        {currentRound} 라운드 - {currentPlayer + 1}번 참가자 차례
      </Text>

      <View style={styles.diceRow}>
        <Dice value={dice?.[0] ?? 1} rolling={!dice} />
        <Dice value={dice?.[1] ?? 1} rolling={!dice} />
      </View>

      <Button title="주사위 굴리기" onPress={handleRoll} color={Colors.primary} />

      <View style={styles.scoreTable}>
        {scores.map((playerScores, idx) => (
          <Text key={idx} style={{ color: Colors.text }}>
            {idx + 1}번 참가자: {playerScores.join(', ')} ({playerScores.reduce((a, b) => a + b, 0)}점)
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', gap: 20 },
  turnText: { fontSize: 20, textAlign: 'center', marginBottom: 10, color: Colors.text },
  diceRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  scoreTable: { marginTop: 30, gap: 6 },
});

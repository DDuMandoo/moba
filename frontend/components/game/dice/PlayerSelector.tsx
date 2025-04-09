import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { Button } from '@/components/ui/Button';

export default function PlayerSelector({
  numPlayers,
  setNumPlayers,
  rounds,
  setRounds,
  onStart,
}: {
  numPlayers: number;
  setNumPlayers: (n: number) => void;
  rounds: number;
  setRounds: (r: number) => void;
  onStart: (names: string[]) => void;
}) {
  const [names, setNames] = useState<string[]>(Array(numPlayers).fill(''));

  const updateName = (i: number, text: string) => {
    const copy = [...names];
    copy[i] = text;
    setNames(copy);
  };

  const handleStart = () => {
    const filled = names.map((n, i) => n.trim() || `${i + 1}번`);
    onStart(filled);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎲 주사위 굴리기</Text>
      <Text style={styles.label}>인원 수: {numPlayers}</Text>
      <View style={styles.row}>
        <Button.Mini title="-" onPress={() => {
          const next = Math.max(1, numPlayers - 1);
          setNumPlayers(next);
          setNames((prev) => prev.slice(0, next));
        }} />
        <Button.Mini title="+" onPress={() => {
          const next = Math.min(10, numPlayers + 1);
          setNumPlayers(next);
          setNames((prev) => [...prev, '']);
        }} />
      </View>

      <Text style={styles.label}>라운드 수: {rounds}</Text>
      <View style={styles.row}>
        <Button.Mini title="-" onPress={() => setRounds(Math.max(1, rounds - 1))} />
        <Button.Mini title="+" onPress={() => setRounds(Math.min(5, rounds + 1))} />
      </View>

      <View style={{ marginTop: 20, width: '80%' }}>
        {Array.from({ length: numPlayers }).map((_, i) => (
          <TextInput
            key={i}
            placeholder={`${i + 1}번 참가자 이름`}
            style={styles.input}
            value={names[i] || ''}
            onChangeText={(text) => updateName(i, text)}
          />
        ))}
      </View>

      <View style={{ marginTop: 24 }}>
        <Button.Large title="게임 시작" onPress={handleStart} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 40, color: Colors.primary },
  label: { fontSize: 18, marginTop: 20, color: Colors.text },
  row: { flexDirection: 'row', gap: 16, marginTop: 10 },
  input: {
    borderBottomWidth: 1,
    borderColor: Colors.grayDarkText,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 16,
    color: Colors.text,
  },
});
// ✅ 완성된 사다리타기 게임: 입력, 랜덤 연결, 사다리 그리기, 결과 모달까지 포함
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Line } from 'react-native-svg';
import Colors from '@/constants/Colors';

const MAX = 6;
const { width } = Dimensions.get('window');
const Icon = require('@/assets/Icon.png');

export default function GhostLegGame() {
  const [count, setCount] = useState(3);
  const [names, setNames] = useState<string[]>(Array(count).fill(''));
  const [results, setResults] = useState<string[]>(Array(count).fill(''));
  const [started, setStarted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mapping, setMapping] = useState<number[]>([]);

  const handleChangeName = (index: number, value: string) => {
    const next = [...names];
    next[index] = value;
    setNames(next);
  };

  const handleChangeResult = (index: number, value: string) => {
    const next = [...results];
    next[index] = value;
    setResults(next);
  };

  const generateMapping = () => {
    const arr = Array.from({ length: count }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const handleStart = () => {
    setMapping(generateMapping());
    setStarted(true);
    setTimeout(() => setVisible(true), 800);
  };

  const handleReset = () => {
    setStarted(false);
    setVisible(false);
    setMapping([]);
  };

  const renderLadder = () => {
    const hSpacing = width / (count + 1);
    const vSpacing = 40;
    const height = vSpacing * 10;
    const lines: JSX.Element[] = [];

    for (let i = 0; i < count; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          x1={(i + 1) * hSpacing}
          y1={0}
          x2={(i + 1) * hSpacing}
          y2={height}
          stroke="black"
          strokeWidth={5}
          strokeLinecap="round"
        />
      );
    }

    for (let y = 1; y < 10; y++) {
      const used: number[] = [];
      const tries = Math.floor(Math.random() * (count - 1));
      for (let i = 0; i < tries; i++) {
        const col = Math.floor(Math.random() * (count - 1));
        if (!used.includes(col)) {
          used.push(col);
          lines.push(
            <Line
              key={`h-${y}-${col}`}
              x1={(col + 1) * hSpacing}
              y1={y * vSpacing}
              x2={(col + 2) * hSpacing}
              y2={y * vSpacing}
              stroke="black"
              strokeWidth={5}
              strokeLinecap="round"
            />
          );
        }
      }
    }

    return (
      <Svg height={height} width={width} style={{ marginVertical: 20 }}>
        {lines}
      </Svg>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView contentContainerStyle={styles.wrapper} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>사다리 수 ({count})</Text>
        <View style={styles.row}>
          {[...Array(MAX)].map((_, i) => (
            <Pressable
              key={i}
              style={[styles.countBtn, count === i + 1 && styles.countActive]}
              onPress={() => {
                setCount(i + 1);
                setNames(Array(i + 1).fill(''));
                setResults(Array(i + 1).fill(''));
                setStarted(false);
                setVisible(false);
              }}
            >
              <Text>{i + 1}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.title}>참가자 이름</Text>
        <View style={styles.iconRow}>
          {names.map((_, i) => (
            <Image key={i} source={Icon} style={styles.icon} />
          ))}
        </View>
        {names.map((name, i) => (
          <TextInput
            key={i}
            style={styles.input}
            placeholder={`참가자 ${i + 1}`}
            value={name}
            onChangeText={(v) => handleChangeName(i, v)}
            editable={!started}
          />
        ))}

        <Text style={styles.title}>결과 (아래)</Text>
        {results.map((res, i) => (
          <TextInput
            key={i}
            style={styles.input}
            placeholder={`결과 ${i + 1}`}
            value={res}
            onChangeText={(v) => handleChangeResult(i, v)}
            editable={!started}
          />
        ))}

        {started && renderLadder()}

        <Pressable
          style={[styles.button, count < 2 && styles.disabled]}
          onPress={handleStart}
          disabled={count < 2}
        >
          <Text style={styles.buttonText}>게임 시작</Text>
        </Pressable>

        <Modal visible={visible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>🎉 결과 🎉</Text>
              {mapping.map((to, i) => (
                <Text key={i} style={styles.modalText}>
                  {names[i] || `참가자 ${i + 1}`} → {results[to] || '???'}
                </Text>
              ))}
              <Pressable style={styles.closeButton} onPress={handleReset}>
                <Text style={styles.buttonText}>닫기</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: Colors.text,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  icon: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    backgroundColor: Colors.white,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  countBtn: {
    backgroundColor: Colors.logoInner,
    padding: 10,
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  countActive: {
    backgroundColor: Colors.logo,
    color: Colors.white
  },
  button: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 12,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});
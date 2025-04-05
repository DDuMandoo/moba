// components/pin/PinInput.tsx
import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Props {
  value?: string;
  onChange: (val: string) => void;
}

export default function PinInput({ value = '', onChange = () => {} }: Props) {
  const safeValue = value ?? '';
  const router = useRouter();
  const [showSuccess, setShowSuccess] = React.useState(false);

  useEffect(() => {
    if (safeValue.length === 6) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.replace('/');
      }, 1500);
    }
  }, [safeValue]);

  const handlePress = (num: string) => {
    if (safeValue.length < 6) {
      onChange(safeValue + num);
    }
  };

  const handleBackspace = () => {
    onChange(safeValue.slice(0, -1));
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>지갑 비밀번호 설정</Text>
      <Text style={styles.subtitle}>지갑 이용을 위한 6자리 비밀번호를 설정해주세요.</Text>

      <View style={styles.dotsContainer}>
        <View style={styles.dotsRow}>
          {[...Array(6)].map((_, i) => (
            <View
              key={i}
              style={[styles.dot, safeValue.length > i && styles.filledDot]}
            />
          ))}
        </View>
      </View>

      <View style={styles.keypad}>
  <View style={styles.keypadRow}>
    {['1', '2', '3'].map((num) => (
      <Pressable key={num} style={styles.key} onPress={() => handlePress(num)}>
        <Text style={styles.keyText}>{num}</Text>
      </Pressable>
    ))}
  </View>
  <View style={styles.keypadRow}>
    {['4', '5', '6'].map((num) => (
      <Pressable key={num} style={styles.key} onPress={() => handlePress(num)}>
        <Text style={styles.keyText}>{num}</Text>
      </Pressable>
    ))}
  </View>
  <View style={styles.keypadRow}>
    {['7', '8', '9'].map((num) => (
      <Pressable key={num} style={styles.key} onPress={() => handlePress(num)}>
        <Text style={styles.keyText}>{num}</Text>
      </Pressable>
    ))}
  </View>
  <View style={styles.keypadRow}>
    <View style={[styles.key, { opacity: 0 }]} />
    <Pressable style={styles.key} onPress={() => handlePress('0')}>
      <Text style={styles.keyText}>0</Text>
    </Pressable>
    <Pressable style={[styles.key, styles.backspaceKey]} onPress={handleBackspace}>
      <Ionicons name="backspace" size={22} color={Colors.primary} />
    </Pressable>
  </View>
</View>

      <Modal transparent visible={showSuccess} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>비밀번호 설정이 완료되었습니다</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    backgroundColor: Colors.grayBackground,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.primary,
    marginBottom: 36,
  },
  dotsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 48,
    width: '85%',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginHorizontal: 8,
    backgroundColor: 'transparent',
  },
  filledDot: {
    backgroundColor: Colors.primary,
  },
  keypad: {
    gap: 16,
    width: '80%',
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 9999,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  backspaceKey: {},
  keyText: {
    fontSize: 22,
    fontFamily: Fonts.regular,
    color: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalBox: {
    backgroundColor: Colors.white,
    paddingVertical: 28,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: '70%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    color: Colors.primary,
    fontFamily: Fonts.regular,
    textAlign: 'center',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
});

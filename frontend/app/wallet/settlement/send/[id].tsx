import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import axiosInstance from '@/app/axiosInstance';

export default function SettlementPinPage() {
  const [pin, setPin] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (pin.length === 6) {
      const password = pin.join('');
      setTimeout(async () => {
        try {
          const res = await axiosInstance.post('/wallets/auth', { password });
          if (res.data.isSuccess) {
            router.replace('/wallet/settlement/success');
          } else {
            throw new Error();
          }
        } catch (err) {
          Alert.alert('비밀번호가 틀렸습니다.');
          setPin([]);
        }
      }, 200);
    }
  }, [pin]);

  const handlePress = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => [...prev, digit]);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileBox}>
        <Image
          source={{ uri: 'https://avatars.githubusercontent.com/u/1?v=4' }}
          style={styles.profileImage}
        />
        <Text style={styles.nameText}>김지호 님에게</Text>
        <Text style={styles.amountText}>50,000원</Text>
        <Text style={styles.instructionText}>
          이체하시려면 비밀번호를 입력해주세요.
        </Text>
      </View>

      <View style={styles.pinContainer}>
        <View style={styles.pinRow}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, { backgroundColor: pin[i] ? '#ccc' : '#eee' }]}
            />
          ))}
        </View>
      </View>

      <View style={styles.keypadWrapper}>
        <View style={styles.keypadRow}>
          {['1', '2', '3'].map((digit) => (
            <TouchableOpacity
              key={digit}
              style={styles.keypadButton}
              onPress={() => handlePress(digit)}
            >
              <Text style={styles.keypadText}>{digit}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keypadRow}>
          {['4', '5', '6'].map((digit) => (
            <TouchableOpacity
              key={digit}
              style={styles.keypadButton}
              onPress={() => handlePress(digit)}
            >
              <Text style={styles.keypadText}>{digit}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keypadRow}>
          {['7', '8', '9'].map((digit) => (
            <TouchableOpacity
              key={digit}
              style={styles.keypadButton}
              onPress={() => handlePress(digit)}
            >
              <Text style={styles.keypadText}>{digit}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keypadRow}>
          <View style={{ width: 72 }} />
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handlePress('0')}
          >
            <Text style={styles.keypadText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={handleDelete}
          >
            <Text style={styles.keypadText}>⌫</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3F2',
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  profileBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.text,
  },
  amountText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginVertical: 4,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.grayDarkText,
  },
  pinContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginBottom: 20,
    width: '75%',
    alignItems: 'center',
  },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#eee',
  },
  keypadWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 32,
  },
  keypadButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadButtonEmpty: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'transparent',
  },
  keypadText: {
    fontSize: 28,
    color: Colors.primary,
  },
});
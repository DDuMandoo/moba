import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Keyboard,
  Image,
  Animated,
} from 'react-native';
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '@/app/axiosInstance';
import * as SecureStore from 'expo-secure-store';
import { getBankMeta } from '@/constants/banks';

interface Props {
  visible: boolean;
  onClose: () => void;
  onVerify: (code: string) => void;
  onResend: () => void;
  timeLeft: number;
  account: string;
  bank: string;
}

export default function AccountVerifyModal({
  visible,
  onClose,
  onVerify,
  onResend,
  timeLeft: initialTimeLeft,
  account,
  bank,
}: Props) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
  const [errorMessage, setErrorMessage] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    setDigits(['', '', '', '']);
    setErrorMessage('');
    setTimeLeft(initialTimeLeft);

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    const focusTimeout = setTimeout(() => {
      requestAnimationFrame(() => {
        inputs.current[0]?.focus();
      });
    }, 300);

    return () => {
      clearInterval(timer);
      clearTimeout(focusTimeout);
    };
  }, [visible, initialTimeLeft]);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    if (digit && index < 3) {
      inputs.current[index + 1]?.focus();
    } else if (index === 3 && digit) {
      Keyboard.dismiss();
      const code = newDigits.join('');
      if (code.length === 4) handleSubmit(code);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = async (code: string) => {
    if (timeLeft <= 0) {
      setErrorMessage('⏰ 인증 시간이 만료되었습니다.');
      triggerShake();
      return;
    }

    try {
      const res = await axiosInstance.post('/wallets/account/auth', {
        code,
        account,
        bank,
      });

      const { accessToken } = res.data.result;
      await SecureStore.setItemAsync('accessToken', accessToken);

      setErrorMessage('');
      onVerify(code);
    } catch (error: any) {
      const message = error?.response?.data?.message || '인증에 실패했습니다.';
      setErrorMessage(`❌ ${message}`);
      triggerShake();
    }
  };

  const formatTime = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!visible) return null;

  const bankMeta = getBankMeta(bank);

  return (
    <View style={styles.fullscreen}>
      <View style={styles.container}>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={Colors.black} />
        </Pressable>

        <Text style={styles.title}>1원 인증</Text>
        <Text style={styles.subtitle}>입력한 계좌의 입금명을 확인해주세요.</Text>

        {account && bank && (
          <View style={styles.accountInfo}>
            <View style={styles.accountRow}>
              <Image source={bankMeta.logo} style={styles.bankLogo} />
              <View>
                <Text style={styles.bankName}>{bankMeta.name}</Text>
                <Text style={styles.accountText}>{account}</Text>
              </View>
            </View>
          </View>
        )}

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Animated.View style={[styles.codeRow, { transform: [{ translateX: shakeAnim }] }]}>
          {digits.map((digit, index) => (
            <TextInput
              key={`input-${index}`}
              ref={(ref) => (inputs.current[index] = ref)}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              style={[styles.codeInput, digit ? styles.codeInputFilled : null]}
              textAlign="center"
            />
          ))}
        </Animated.View>

        <View style={styles.footerRow}>
          <Text style={[styles.timer, timeLeft < 30 ? styles.timerWarning : null]}>
            남은 시간: {formatTime(timeLeft)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  container: {
    backgroundColor: Colors.white,
    width: '85%',
    borderRadius: 16,
    padding: 24,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.extraBold,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.grayDarkText,
    marginBottom: 20,
  },
  accountInfo: {
    backgroundColor: Colors.grayBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bankLogo: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: 6,
  },
  bankName: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 2,
  },
  accountText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  errorText: {
    fontFamily: Fonts.bold,
    color: '#FF5A5A',
    fontSize: 15,
    marginBottom: 12,
    textAlign: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  codeInput: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.grayLightText,
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  codeInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: '#F5F9FF',
  },
  footerRow: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  timer: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.grayDarkText,
  },
  timerWarning: {
    color: '#FF6B6B',
  },
});
1
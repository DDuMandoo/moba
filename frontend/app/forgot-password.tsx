import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
  Alert
} from 'react-native';
import { Button } from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import axios from 'axios';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.API_URL;

const showAlert = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}${message ? '\n' + message : ''}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [isAuthCodeSent, setIsAuthCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isEmailValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const startTimer = () => {
    setTimer(300);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1 && timerRef.current) {
          clearInterval(timerRef.current);
          setIsAuthCodeSent(false);
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTimer = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  const handleCheckEmail = async () => {
    if (!isEmailValid(email)) return showAlert('이메일 오류', '올바른 이메일 주소를 입력해주세요.');
    try {
      const checkRes = await axios.post(`${BASE_URL}/auth/email`, { email });
      if (!checkRes.data.result) {
        showAlert('가입되지 않은 이메일', '입력한 이메일은 가입되어 있지 않습니다.');
        return;
      }

      const sendRes = await axios.post(`${BASE_URL}/emails/send`, { email });
      if (sendRes.status === 200 && sendRes.data.isSuccess) {
        showAlert('인증번호 발송', '이메일로 인증번호를 전송했습니다.');
        setIsAuthCodeSent(true);
        setIsEmailVerified(false);
        startTimer();
      } else {
        showAlert('오류', '인증번호 발송에 실패했습니다.');
      }
    } catch {
      showAlert('오류', '이메일 인증 중 문제가 발생했습니다.');
    }
  };

  const handleVerifyCode = async () => {
    if (!authCode || !email) return showAlert('입력 오류', '인증번호를 입력해주세요.');
    try {
      const res = await axios.post(`${BASE_URL}/emails/verify`, { email, code: authCode });
      if (res.status === 200 && res.data.result) {
        setIsEmailVerified(true);
        if (timerRef.current) clearInterval(timerRef.current);
        showAlert('성공', '이메일 인증 완료');
      } else {
        showAlert('실패', '인증번호가 올바르지 않습니다.');
      }
    } catch {
      showAlert('실패', '인증번호 확인 중 오류 발생');
    }
  };

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    if (!email || !isEmailVerified) return showAlert('입력 오류', '이메일 인증을 완료해주세요.');

    try {
      const res = await axios.post(`${BASE_URL}/members/password/reset`, { email });
      if (res.status === 200) {
        showAlert('임시 비밀번호 발급 완료', '이메일을 확인해주세요.');
      }
    } catch (error: any) {
      if (error?.response?.status === 429) {
        showAlert('요청 제한', '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
      } else {
        showAlert('오류', '비밀번호 발급 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>비밀번호 찾기</Text>
      <Text style={styles.subtitle}>기존에 가입하신 이메일을 입력하시면, {'\n'}임시 비밀번호를 발급해드립니다.</Text>

      <Text style={styles.label}>이메일 아이디</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.inputWithButton, isEmailVerified && styles.disabledInput]}
          placeholder="example@naver.com"
          placeholderTextColor={Colors.grayLightText}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setIsAuthCodeSent(false);
            setIsEmailVerified(false);
          }}
          keyboardType="email-address"
          editable={!isEmailVerified}
        />
        <TouchableOpacity style={styles.inlineButton} onPress={handleCheckEmail} disabled={isEmailVerified}>
          <Text style={styles.inlineButtonText}>중복확인</Text>
        </TouchableOpacity>
      </View>

      {isAuthCodeSent && (
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.inputWithTimer, isEmailVerified && styles.disabledInput]}
            placeholder="인증번호를 입력해주세요"
            placeholderTextColor={Colors.grayLightText}
            value={authCode}
            onChangeText={setAuthCode}
            keyboardType="number-pad"
            editable={!isEmailVerified}
          />
          {timer > 0 && !isEmailVerified && (
            <Text style={styles.timerText}>{formatTimer(timer)}</Text>
          )}
          <TouchableOpacity style={styles.inlineButton} onPress={handleVerifyCode} disabled={isEmailVerified}>
            <Text style={styles.inlineButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      )}

      <Button.Large
        title="임시 비밀번호 발급"
        onPress={handleResetPassword}
        style={styles.submitButton}
        textColor={Colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding : '5%'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16
  },
  subtitle: {
    fontSize: 16,
    color: Colors.grayDarkText,
    marginBottom: 40
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 12
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 16
  },
  inputWithButton: {
    height: 50,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.black,
    paddingRight: 100
  },
  inputWithTimer: {
    height: 50,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingLeft: 80,
    paddingRight: 100,
    fontSize: 16,
    color: Colors.black
  },
  timerText: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
    fontSize: 14,
    color: Colors.grayDarkText
  },
  inlineButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -14 }],
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.grayBackground,
    borderRadius: 8
  },
  inlineButtonText: {
    fontSize: 14,
    color: Colors.grayDarkText
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    borderRadius: 16
  },
  disabledInput: {
    backgroundColor: '#F4F4F4',
    color: Colors.grayDarkText
  }
});
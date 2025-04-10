import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { Button } from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { saveTokens } from '@/app/axiosInstance';
import CustomAlert from '@/components/CustomAlert';
import { getFcmToken } from '@/utils/fcmToken';
import { login as kakaoLogin } from '@react-native-seoul/kakao-login';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ title: string; message?: string } | null>(null);

  const showAlert = (title: string, message?: string) => {
    setAlert({ title, message });
  };

  const isEmailValid = (email: string) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);

  const handleLogin = async () => {
    Keyboard.dismiss();

    if (!isEmailValid(email)) {
      showAlert('이메일 오류', '유효한 이메일 주소를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/auth/signin`, { email, password }, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        const { accessToken, refreshToken } = response.data.result;
        await saveTokens(accessToken, refreshToken);

        const fcmToken = await getFcmToken();
        if (fcmToken) {
          await axios.post(`${BASE_URL}/fcm`, { token: fcmToken }, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
        }

        const redirect = params.redirect;
        const redirectPath = Array.isArray(redirect) ? redirect[0] : redirect;
        const fallbackPath = '/(bottom-navigation)';

        router.replace(
          typeof redirectPath === 'string' ? (redirectPath as any) : '/(bottom-navigation)'
        );
      } else {
        showAlert('로그인 실패', '이메일 혹은 비밀번호를 다시 확인해주세요!');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || '서버 오류가 발생했습니다.';
      showAlert('로그인 실패', message);
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    try {
      const token = await kakaoLogin();
      const kakaoAccessToken = token.accessToken;

      const response = await axios.post(`${BASE_URL}/auth/social/kakao`, {
        accessToken: kakaoAccessToken
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const { accessToken, refreshToken } = response.data.result;
      await saveTokens(accessToken, refreshToken);

      router.replace('/(bottom-navigation)');
    } catch (err: any) {
      showAlert('로그인 실패', err?.message || '카카오 로그인에 실패했습니다.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.logo }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 40}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Image source={require('@/assets/images/login_image.png')} style={styles.logo} />

          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            placeholder="이메일을 입력해주세요"
            placeholderTextColor={Colors.grayLightText}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => Keyboard.dismiss()}
          />

          <Text style={styles.label}>비밀번호</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="비밀번호를 입력해주세요"
              placeholderTextColor={Colors.grayLightText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <Ionicons
                name={isPasswordVisible ? 'eye' : 'eye-off'}
                size={24}
                color={Colors.grayDarkText}
              />
            </TouchableOpacity>
          </View>

          <Button.Large title="로그인" onPress={handleLogin} style={styles.loginButton} />

          <Button.Large
            title="카카오 로그인"
            onPress={handleKakaoLogin}
            style={{ backgroundColor: '#FFDD00' }}
            textColor={Colors.primary}
          />

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
              <Text style={styles.footerText}>비밀번호 찾기</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
              <Text style={styles.footerText}>회원가입</Text>
            </TouchableOpacity>
          </View>

          <CustomAlert
            visible={!!alert}
            title={alert?.title || ''}
            message={alert?.message}
            onClose={() => setAlert(null)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.logo,
    padding: '5%',
    paddingTop: 50,
    height: '100%'
  },
  logo: {
    width: 250,
    height: 250,
    alignSelf: 'center'
  },
  label: {
    alignSelf: 'flex-start',
    width: '100%',
    fontSize: 20,
    color: Colors.white,
    marginBottom: 5
  },
  input: {
    height: 50,
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 16,
    fontSize: 16,
    color: 'black'
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
    position: 'relative'
  },
  passwordInput: {
    height: 50,
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: 'black'
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }]
  },
  loginButton: {
    marginBottom: 15,
    backgroundColor: Colors.primary
  },
  footer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10
  },
  footerText: {
    color: Colors.white,
    fontSize: 14
  }
});

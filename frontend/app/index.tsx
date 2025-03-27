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
  Alert,
} from 'react-native';
import { Button } from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.API_URL;
console.log('🌐 BASE_URL:', BASE_URL);

// 플랫폼 구분 alert
const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isEmailValid = (email: string) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);

  const handleLogin = async () => {
    Keyboard.dismiss();
    console.log('🧪 로그인 시도');

    if (!isEmailValid(email)) {
      console.log('❌ 이메일 형식 오류:', email);
      showAlert('이메일 오류', '유효한 이메일 주소를 입력해주세요.');
      return;
    }

    try {
      console.log('📤 로그인 요청:', `${BASE_URL}/auth/signin`);
      const response = await axios.post(
        `${BASE_URL}/auth/signin`,
        { email, password },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      console.log('✅ 로그인 응답 수신:', response.status, response.data);

      if (response.status === 200) {
        console.log('🎉 로그인 성공 → 메인 페이지로 이동');
        router.push('/(bottom-navigation)');
      } else {
        console.log('⚠️ 로그인 응답 실패:', response.status);
        showAlert('로그인 실패', '이메일 혹은 비밀번호를 다시 확인해주세요!');
      }
    } catch (error: any) {
      console.log('❌ 로그인 에러:', error?.response?.data || error.message);
      showAlert('로그인 실패', '이메일 혹은 비밀번호를 다시 확인해주세요!');
    }
  };

  return (
    <View style={styles.container}>
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
          onPress={() => {
            setIsPasswordVisible(!isPasswordVisible);
            console.log(`👁️ 비밀번호 ${!isPasswordVisible ? '보이기' : '숨기기'}`);
          }}
        >
          <Ionicons
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            size={24}
            color={Colors.grayDarkText}
          />
        </TouchableOpacity>
      </View>

      <Button.Large title="로그인" onPress={handleLogin} style={styles.loginButton} />

      <Button.Large
        title="카카오 로그인"
        onPress={() => {
          console.log('⚠️ 카카오 로그인은 아직 미구현');
        }}
        style={{ backgroundColor: '#FFDD00' }}
        textColor={Colors.primary}
      />

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.push('/forgot-password')}>
          <Text style={styles.footerText}>비밀번호 찾기</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text style={styles.footerText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    padding: '5%',
    height: '100%'
  },
  logo: {
    width: 280,
    height: 280,
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

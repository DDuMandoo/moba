import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';
import Colors from '@/constants/Colors';
import { Button } from '@/components/ui/Button';

const BASE_URL = Constants.expoConfig?.extra?.API_URL;

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isAuthCodeSent, setIsAuthCodeSent] = useState(false);

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
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const formatTimer = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleCheckEmail = async () => {
    if (!isEmailValid(email)) {
      Alert.alert('이메일 오류', '올바른 이메일 주소를 입력해주세요.');
      return;
    }
    try {
      const sendRes = await axios.post(`${BASE_URL}/emails/send`, { email });
      if (sendRes.status === 200 && sendRes.data.isSuccess) {
        Alert.alert('인증번호 발송', '이메일로 인증번호를 전송했습니다.');
        setIsAuthCodeSent(true);
        setIsEmailVerified(false);
        startTimer();
      } else {
        Alert.alert('오류', '인증번호 발송에 실패했습니다.');
      }
    } catch {
      Alert.alert('오류', '이메일 인증 중 문제가 발생했습니다.');
    }
  };

  const handleVerifyCode = async () => {
    if (!authCode || !email) return Alert.alert('입력 오류', '인증번호를 입력해주세요.');
    try {
      const res = await axios.post(`${BASE_URL}/emails/verify`, { email, code: authCode });
      if (res.status === 200 && res.data.result) {
        setIsEmailVerified(true);
        if (timerRef.current) clearInterval(timerRef.current);
        Alert.alert('성공', '이메일 인증 완료');
      } else {
        Alert.alert('실패', '인증번호가 올바르지 않습니다.');
      }
    } catch {
      Alert.alert('실패', '인증번호 확인 중 오류 발생');
    }
  };

  const handleSignup = async () => {
    Keyboard.dismiss();
    if (!name || !email || !password || !confirmPassword)
      return Alert.alert('입력 오류', '모든 필수 항목을 입력해주세요.');
    if (!isEmailVerified)
      return Alert.alert('인증 필요', '이메일 인증을 완료해주세요.');
    if (password !== confirmPassword)
      return Alert.alert('비밀번호 불일치', '비밀번호가 다릅니다.');

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('name', name);
      if (image) {
        const filename = image.split('/').pop()!;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('image', { uri: image, name: filename, type } as any);
      }
      const res = await axios.post(`${BASE_URL}/auth/signup`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.status === 201) {
        Alert.alert('회원가입 완료', '로그인 해주세요.');
        router.replace('/');
      }
    } catch {
      Alert.alert('회원가입 실패', '잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <View style={styles.imageCircle}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <Ionicons name="person" size={60} color={Colors.grayLightText} />
          )}
          <View style={styles.editIcon}>
            <Ionicons name="pencil" size={16} color="#888" />
          </View>
        </View>
      </TouchableOpacity>

      <Text style={styles.label}>이름 <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={styles.input}
        placeholder="이름을 입력해주세요."
        placeholderTextColor={Colors.grayLightText}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>이메일 아이디 <Text style={styles.required}>*</Text></Text>
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

      <Text style={styles.label}>비밀번호 입력 <Text style={styles.required}>*</Text></Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.inputWithIcon}
          placeholder="비밀번호를 입력해주세요."
          placeholderTextColor={Colors.grayLightText}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!isPasswordVisible}
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
          <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color={Colors.grayDarkText} />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>비밀번호 확인 <Text style={styles.required}>*</Text></Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.inputWithIcon}
          placeholder="비밀번호를 다시 입력해주세요."
          placeholderTextColor={Colors.grayLightText}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!isConfirmVisible}
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setIsConfirmVisible(!isConfirmVisible)}>
          <Ionicons name={isConfirmVisible ? 'eye-off' : 'eye'} size={24} color={Colors.grayDarkText} />
        </TouchableOpacity>
      </View>

      <Button.Large
        title="다음"
        onPress={handleSignup}
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
    paddingHorizontal: 24,
    paddingTop: 48
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 24
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 32
  },
  imageCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: Colors.grayLightText,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 70
  },
  editIcon: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.grayLightText
  },
  label: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 6
  },
  required: {
    color: Colors.secondary
  },
  input: {
    height: 50,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.black,
    marginBottom: 16
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
    paddingHorizontal: 100,
    fontSize: 16,
    color: Colors.black,
    paddingLeft: 80
  },
  timerText: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
    color: Colors.grayDarkText,
    fontSize: 14
  },
  inputWithIcon: {
    height: 50,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.black,
    paddingRight: 45
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
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }]
  },
  submitButton: {
    marginTop: 32,
    backgroundColor: Colors.primary,
    borderRadius: 16
  },
  disabledInput: {
    backgroundColor: '#F4F4F4',
    color: Colors.grayDarkText
  }
});
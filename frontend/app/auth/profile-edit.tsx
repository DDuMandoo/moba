import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import LoadingModal from '@/components/modal/LoadingModal';
import CustomAlert from '@/components/CustomAlert';
import axiosInstance from '@/app/axiosInstance';
import { fetchUserProfile } from '@/redux/slices/userSlice';

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.profile);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ title: string; message?: string } | null>(null);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setName('');
      setEmail(user.email);
      setImage(user.image || null);
    }
  }, [user]);

  const showAlert = (title: string, message?: string) => {
    setAlert({ title, message });
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSave = async () => {
    Keyboard.dismiss();

    if (newPassword && newPassword !== confirmPassword) {
      return showAlert('비밀번호 오류', '비밀번호가 서로 다릅니다.');
    }

    const formData = new FormData();
    if (name.trim() !== '') formData.append('name', name);
    if (newPassword) formData.append('password', newPassword);
    if (image && image !== user?.image) {
      const fileName = image.split('/').pop();
      const file = {
        uri: image,
        name: fileName,
        type: 'image/jpeg'
      } as any;
      formData.append('image', file);
    }

    try {
      setLoading(true);
      const res = await axiosInstance.patch('/members/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.status === 200) {
        showAlert('성공', '프로필이 수정되었습니다.');
        console.log('✅ 프로필 수정 성공:', res.data);
        await new Promise((r) => setTimeout(r, 700));
        await dispatch(fetchUserProfile()).unwrap();
        setTimeout(() => router.back(), 500);
      } else {
        showAlert('오류', '프로필 수정에 실패했습니다.');
      }
    } catch (e) {
      showAlert('에러', '서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
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

      <Text style={styles.label}>이름</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder={user?.name || '이름을 입력해주세요'}
        placeholderTextColor={Colors.grayLightText}
      />

      <Text style={styles.label}>이메일</Text>
      <View style={styles.emailBox}>
        <Text style={styles.emailText}>{email}</Text>
      </View>

      <Text style={styles.label}>새 비밀번호</Text>
      <View style={styles.passwordBox}>
        <TextInput
          style={styles.inputPassword}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="새 비밀번호"
          placeholderTextColor={Colors.grayLightText}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color={Colors.grayDarkText} />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>비밀번호 확인</Text>
      <View style={styles.passwordBox}>
        <TextInput
          style={styles.inputPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="비밀번호 확인"
          placeholderTextColor={Colors.grayLightText}
          secureTextEntry={!showConfirm}
        />
        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
          <Ionicons name={showConfirm ? 'eye' : 'eye-off'} size={20} color={Colors.grayDarkText} />
        </TouchableOpacity>
      </View>

      <Button.Large
        title="저장"
        onPress={handleSave}
        style={{ marginTop: 24, backgroundColor: Colors.primary }}
        textColor={Colors.white}
      />

      <LoadingModal visible={loading} />
      <CustomAlert
        visible={!!alert}
        title={alert?.title || ''}
        message={alert?.message}
        onClose={() => setAlert(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: '5%'
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: Colors.text
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.black,
    marginBottom: 20
  },
  emailBox: {
    backgroundColor: Colors.grayBackground,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20
  },
  emailText: {
    fontSize: 16,
    color: Colors.grayDarkText
  },
  passwordBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 16
  },
  inputPassword: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: Colors.black
  }
});

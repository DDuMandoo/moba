// components/modals/ConfirmPasswordModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  userId: string;
}

export default function ConfirmPasswordModal({
  visible,
  onClose,
  onConfirm,
  userId
}: Props) {
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const handleConfirm = () => {
    onConfirm(password);
    setPassword('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.box} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>본인 확인</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subText}>본인 확인을 위해 비밀번호를 입력해주세요.</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>아이디</Text>
            <View style={styles.readonlyInput}>
              <Text style={styles.readonlyText}>{userId}</Text>
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>비밀번호</Text>
            <View style={styles.passwordInputBox}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="8~16자리 숫자, 영문자, 특수문자"
                placeholderTextColor={Colors.grayLightText}
                secureTextEntry={!isVisible}
              />
              <TouchableOpacity onPress={() => setIsVisible(!isVisible)} style={styles.eyeIcon}>
                <Ionicons
                  name={isVisible ? 'eye' : 'eye-off'}
                  size={20}
                  color={Colors.grayDarkText}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmText}>확인</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center'
  },
  box: {
    backgroundColor: Colors.white,
    width: '85%',
    borderRadius: 16,
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black
  },
  subText: {
    fontSize: 14,
    color: Colors.grayDarkText,
    marginBottom: 20
  },
  inputWrapper: {
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.grayDarkText,
    marginBottom: 6
  },
  readonlyInput: {
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    padding: 12
  },
  readonlyText: {
    color: Colors.white,
    fontSize: 16
  },
  passwordInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: Colors.primary,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12
  },
  passwordInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: Colors.black
  },
  eyeIcon: {
    marginLeft: 6
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10
  },
  confirmText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold'
  }
});

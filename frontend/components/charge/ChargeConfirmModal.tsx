// components/charge/ChargeConfirmModal.tsx
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

interface Props {
  onClose: () => void;
}

export default function ChargeConfirmModal({ onClose }: Props) {
  return (
    <View style={styles.overlay}>
      <View style={styles.modalBox}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Feather name="x" size={24} color={Colors.black} />
        </TouchableOpacity>

        <View style={styles.contentBox}>
          <Text style={styles.title}>충전이 완료되었습니다!</Text>
          {/* 필요시 금액, 계좌, 날짜 등의 정보 추가 */}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: '100%',
    padding: 24,
    paddingTop: 16,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  contentBox: {
    paddingTop: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
});

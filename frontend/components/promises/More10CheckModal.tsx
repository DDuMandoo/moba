// ✅ 약속 시작 10분 이상 남았을 때 뜨는 안내 모달 컴포넌트
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import Colors from '@/constants/Colors';

interface More10CheckModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function More10CheckModal({ visible, onClose }: More10CheckModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* 닫기 버튼 */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {/* 이미지 */}
          <Image
            source={require('@/assets/images/wonderCapybara.png')}
            style={styles.image}
            resizeMode="contain"
          />

          {/* 텍스트 */}
          <View style={styles.textBox}>
            <Text style={styles.textLine}>다른 사람들이 어디쯤 오고 있는지 궁금하신가요?</Text>
            <Text style={styles.textLine}>
              약속 <Text style={styles.highlight}>10분 전</Text>부터 
            </Text>
            <Text style={styles.textLine}>지도에서 참가자들의 위치를 확인할 수 있습니다!</Text>
            <Text style={styles.textLine}>
              버튼을 누를 때마다 바뀌는 <Text style={styles.highlight}>실시간 위치</Text>를 확인해보세요.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '90%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    alignItems: 'center',
    padding: 10,
    position: 'relative',
    paddingBottom: 30,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#000',
  },
  image: {
    width: 200,
    height: 200,
  },
  textBox: {
    width: '100%',
    gap: 5,
  },
  textLine: {
    fontSize: 15,
    lineHeight: 24,
    color: '#000',
    textAlign: 'center',
    fontFamily: 'NanumSquareRound',
  },
  highlight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
});
import React from 'react';
import { Modal, View, Text, Image, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

interface QuitAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const QuitAppointmentModal = ({ visible, onClose, onConfirm }: QuitAppointmentModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={{ flex: 1 }} />
            <Ionicons name="close" size={30} color={Colors.black} onPress={onClose} />
          </View>
          <Image source={require('@/assets/images/QuitCheck.png')} style={styles.image} />
          <Text style={styles.message}>
            약속을 정말 <Text style={styles.emphasis}>종료</Text>하시겠습니까?
          </Text>
          <Text style={styles.submessage}>
            약속을 종료하면 다시는 수정할 수 없어요.
          </Text>
          <View style={styles.buttonRow}>
            <Button.Small
              title="취소"
              onPress={onClose}
              textColor={Colors.primary}
              style={{
                backgroundColor: Colors.white,
                borderColor: Colors.primary,
                borderWidth: 1.5,
              }}
            />
            <Button.Small
              title="확인"
              onPress={onConfirm}
              textColor={Colors.white}
              style={{
                backgroundColor: Colors.primary,
                borderColor: Colors.primary,
                borderWidth: 1.5,
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default QuitAppointmentModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: '5%',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  image: {
    width: 150,
    height: 150,
    marginVertical: 16,
    resizeMode: 'contain',
  },
  message: {
    fontSize: 18,
    color: Colors.black,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emphasis: {
    fontSize: 22,
    color: 'red',
  },
  submessage: {
    fontSize: 18,
    color: Colors.black,
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
});

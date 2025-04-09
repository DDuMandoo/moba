// components/CustomAlert.tsx
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextStyle } from 'react-native';
import Colors from '@/constants/Colors';

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  titleStyle?: TextStyle;
  messageStyle?: TextStyle;
}

export default function CustomAlert({
  visible,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = '확인',
  cancelText = '취소',
  titleStyle,
  messageStyle,
}: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          {message && <Text style={[styles.message, messageStyle]}>{message}</Text>}
          {onConfirm ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
                <Text style={[styles.buttonText, styles.cancelButtonText]}>{cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onConfirm} style={styles.button}>
                <Text style={styles.buttonText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={onClose} style={styles.button}>
              <Text style={styles.buttonText}>확인</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
    borderRadius: 10,
    padding: 24,
    width: '90%',
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 24
  },
  message: {
    fontSize: 18,
    color: Colors.grayDarkText,
    textAlign: 'center',
    marginBottom: 24
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14
  },
  cancelButton: {
    backgroundColor: Colors.grayBackground
  },
  cancelButtonText: {
    color: Colors.text
  }
});
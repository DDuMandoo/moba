import React from 'react';
import { Modal, View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  onClose: () => void;
}

export default function CustomAlert({ visible, title, message, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>확인</Text>
          </TouchableOpacity>
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
    borderRadius: 10, // ✅ 둥글게!
    padding: 24,
    width: '90%',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 30
  },
  message: {
    fontSize: 20,
    color: Colors.grayDarkText,
    textAlign: 'left',
    marginBottom: 30
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16
  }
});

import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

export default function LoadingModal({ visible }: { visible: boolean }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <LottieView
          source={require('@/assets/animations/loading.json')} // 🔁 여기에 Lottie 넣기
          autoPlay
          loop
          style={{ width: 250, height: 250 }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

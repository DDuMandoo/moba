import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

export default function LoadingModal({ visible }: { visible: boolean }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Image
          source={require('../../assets/animations/loading.gif')}
          style={{ width: 500, height: 500 }}
          contentFit="contain"
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

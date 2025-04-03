import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

interface DotIndicatorProps {
  activeIndex: number;
  onDotPress?: (index: number) => void;
}

const DotIndicator = ({ activeIndex, onDotPress }: DotIndicatorProps) => {
  return (
    <View style={styles.container}>
      {[0, 1].map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.dot,
            index === activeIndex ? styles.activeDot : styles.inactiveDot,
          ]}
          onPress={() => onDotPress?.(index)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 50,
  },
  activeDot: {
    backgroundColor: Colors.primary,
  },
  inactiveDot: {
    backgroundColor: Colors.secondary,
    opacity: 0.3,
  },
});

export default DotIndicator;

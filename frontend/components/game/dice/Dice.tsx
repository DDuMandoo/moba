import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Colors from '@/constants/Colors';

const diceMap = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function Dice({ value, rolling }: { value: number; rolling?: boolean }) {
  const rotation = new Animated.Value(0);

  if (rolling) {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    ).start();
  }

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.dice, rolling && { transform: [{ rotate: spin }] }]}>
      <Text style={styles.diceText}>{diceMap[value - 1]}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dice: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  diceText: {
    fontSize: 48,
  },
});
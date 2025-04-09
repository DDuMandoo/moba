import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Rect, Circle } from 'react-native-svg';
import Colors from '@/constants/Colors';

const dotMatrix: { [key: number]: [number, number][][] } = {
  1: [[[1, 1]]],
  2: [[[0, 0]], [[2, 2]]],
  3: [[[0, 0]], [[1, 1]], [[2, 2]]],
  4: [[[0, 0], [0, 2]], [[2, 0], [2, 2]]],
  5: [[[0, 0], [0, 2]], [[1, 1]], [[2, 0], [2, 2]]],
  6: [[[0, 0], [0, 2]], [[1, 0], [1, 2]], [[2, 0], [2, 2]]],
};

export default function Dice({ value, rolling }: { value: number; rolling?: boolean }) {
  const [displayValue, setDisplayValue] = useState(value);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (rolling) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      const interval = setInterval(() => {
        const random = Math.floor(Math.random() * 6) + 1;
        setDisplayValue(random);
      }, 80);

      return () => {
        clearInterval(interval);
        rotateAnim.stopAnimation();
      };
    } else {
      setDisplayValue(value);
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.75,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [rolling]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.dice,
        {
          transform: [
            { rotate: rolling ? rotate : '0deg' },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <Svg width="80" height="80">
        <Rect width="80" height="80" rx="12" fill={Colors.white} />
        {dotMatrix[displayValue].flat().map(([row, col], idx) => (
          <Circle
            key={idx}
            cx={20 + col * 20}
            cy={20 + row * 20}
            r={6}
            fill={Colors.black}
          />
        ))}
      </Svg>
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
});

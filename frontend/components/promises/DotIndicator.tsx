// components/promises/DotIndicator.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

interface DotIndicatorProps {
  activeIndex: number; // 0 or 1
}

const DotIndicator: React.FC<DotIndicatorProps> = ({ activeIndex }) => {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim1, {
        toValue: activeIndex === 0 ? 1 : 0,
        duration: 250,
        useNativeDriver: false
      }),
      Animated.timing(anim2, {
        toValue: activeIndex === 1 ? 1 : 0,
        duration: 250,
        useNativeDriver: false
      })
    ]).start();
  }, [activeIndex]);

  const dotStyle = (animatedValue: Animated.Value) => ({
    width: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [8, 14]
    }),
    height: 8,
    borderRadius: 4,
    backgroundColor: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#D4D4D4', '#1F2937'] // gray-300 to gray-800
    }),
    marginHorizontal: 4
  });

  return (
    <View className="flex-row justify-center items-center mt-2 mb-4">
      <Animated.View style={dotStyle(anim1)} />
      <Animated.View style={dotStyle(anim2)} />
    </View>
  );
};

export default DotIndicator;

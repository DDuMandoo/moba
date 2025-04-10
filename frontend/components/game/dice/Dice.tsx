
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Easing, Image } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Colors from "@/constants/Colors";

const logo = require("@/assets/Icon.png");

interface Props {
  value: number | null;
  rolling: boolean;
}

const dotPositions: Record<number, { cx: number; cy: number }[]> = {
  1: [{ cx: 50, cy: 50 }],
  2: [
    { cx: 30, cy: 30 },
    { cx: 70, cy: 70 },
  ],
  3: [
    { cx: 30, cy: 30 },
    { cx: 50, cy: 50 },
    { cx: 70, cy: 70 },
  ],
  4: [
    { cx: 30, cy: 30 },
    { cx: 30, cy: 70 },
    { cx: 70, cy: 30 },
    { cx: 70, cy: 70 },
  ],
  5: [
    { cx: 30, cy: 30 },
    { cx: 30, cy: 70 },
    { cx: 70, cy: 30 },
    { cx: 70, cy: 70 },
    { cx: 50, cy: 50 },
  ],
  6: [
    { cx: 30, cy: 25 },
    { cx: 30, cy: 50 },
    { cx: 30, cy: 75 },
    { cx: 70, cy: 25 },
    { cx: 70, cy: 50 },
    { cx: 70, cy: 75 },
  ],
};

export default function Dice({ value, rolling }: Props) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (rolling) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        })
      ).start();
    } else {
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
    }
  }, [rolling]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={[styles.dice, { transform: [{ rotate: spin }] }]}>
      {rolling ? (
        <Image source={logo} style={styles.logo} />
      ) : (
        <Svg height="100" width="100" viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="48" fill={Colors.white} />
          {value &&
            dotPositions[value]?.map((dot, i) => (
              <Circle key={i} cx={dot.cx} cy={dot.cy} r="6" fill="#000" />
            ))}
        </Svg>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dice: {
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
});

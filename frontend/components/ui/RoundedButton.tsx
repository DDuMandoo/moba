// 📂app/components/ui/RoundedButton.tsx

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';

type ButtonSize = 'lg' | 'md' | 'sm' | 'xs';

interface Props extends TouchableOpacityProps {
  title: string;
  size?: ButtonSize;
  fullWidth?: boolean; // true면 width 100%
}

export default function RoundedButton({
  title,
  size = 'md',
  fullWidth = false,
  style,
  ...props
}: Props) {
  const { width: screenWidth } = useWindowDimensions();

  const sizeMap = {
    lg: { height: 60, fontSize: 18, paddingHorizontal: 28 },
    md: { height: 50, fontSize: 16, paddingHorizontal: 24 },
    sm: { height: 40, fontSize: 14, paddingHorizontal: 20 },
    xs: { height: 32, fontSize: 13, paddingHorizontal: 16 },
  };

  const { height, fontSize, paddingHorizontal } = sizeMap[size];

  const buttonStyle: ViewStyle = {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height,
    paddingHorizontal,
    width: fullWidth ? '100%' : undefined,
  };

  return (
    <TouchableOpacity style={[buttonStyle, style]} activeOpacity={0.8} {...props}>
      <Text style={{ color: Colors.white, fontFamily: Fonts.bold, fontSize }}>{title}</Text>
    </TouchableOpacity>
  );
}

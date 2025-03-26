import React from 'react';
import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  useWindowDimensions,
} from 'react-native';
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';

interface Props extends TouchableOpacityProps {
  title: string;
  widthRatio: number;
  heightRatio: number;
  radius?: number;
  fontSize?: number;
}

export default function RoundedButtonBase({
  title,
  widthRatio,
  heightRatio,
  radius,
  fontSize,
  style,
  ...props
}: Props) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const width = screenWidth * widthRatio;
  const height = screenHeight * heightRatio;
  const finalRadius = radius ?? height / 2;
  const finalFontSize = fontSize ?? height * 0.4;

  return (
    <TouchableOpacity
      style={[
        {
          width,
          height,
          backgroundColor: Colors.primary,
          borderRadius: finalRadius,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
      activeOpacity={0.8}
      {...props}
    >
      <Text
        style={{
          color: Colors.white,
          fontFamily: Fonts.bold,
          fontSize: finalFontSize,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

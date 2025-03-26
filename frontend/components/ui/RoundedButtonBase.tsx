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
  textColor?: string; // 🔥 텍스트 색상 추가
}

export default function RoundedButtonBase({
  title,
  widthRatio,
  heightRatio,
  radius,
  fontSize,
  textColor = Colors.white, // 기본값: 화이트
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
          color: textColor, // 🔥 커스텀 텍스트 색상 적용
          fontFamily: Fonts.bold,
          fontSize: finalFontSize,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

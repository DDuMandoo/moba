/**
 * Button 컴포넌트
 *
 * ✅ 사용 방법:
 * import { Button } from '@/components/ui/Button';
 *
 * <Button.Large title="로그인" onPress={handlePress} />
 * <Button.Tiny title="더보기" onPress={handleMore} textColor={Colors.black} />
 *
 * ✅ 내부적으로는 반응형 비율 기반의 RoundedButtonBase를 사용하며,
 * 버튼 크기/라운드/폰트 크기를 자동 조정합니다.
 */

import React from 'react';
import RoundedButtonBase from './RoundedButtonBase';
import { TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  textColor?: string; // 🔥 텍스트 색상 추가
}

const Large = (props: ButtonProps) => (
  <RoundedButtonBase widthRatio={0.9} heightRatio={0.055} radius={10} fontSize={22} {...props} />
);

const Medium = (props: ButtonProps) => (
  <RoundedButtonBase widthRatio={0.8} heightRatio={0.051} radius={10} fontSize={22} {...props} />
);

const MidSmall = (props: ButtonProps) => (
  <RoundedButtonBase widthRatio={0.425} heightRatio={0.048} radius={12} fontSize={20} {...props} />
);

const Small = (props: ButtonProps) => (
  <RoundedButtonBase widthRatio={0.384} heightRatio={0.048} radius={12} fontSize={20} {...props} />
);

const Mini = (props: ButtonProps) => (
  <RoundedButtonBase widthRatio={0.2} heightRatio={0.034} radius={10} fontSize={20} {...props} />
);

const Tiny = (props: ButtonProps) => (
  <RoundedButtonBase widthRatio={0.113} heightRatio={0.034} radius={10} fontSize={16} {...props} />
);

export const Button = {
  Large,
  Medium,
  MidSmall,
  Small,
  Mini,
  Tiny,
};

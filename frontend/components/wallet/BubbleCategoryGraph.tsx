import React from 'react';
import { View, Text } from 'react-native';
import { Svg, Circle, Line } from 'react-native-svg';
import Colors from '@/constants/Colors';

interface BubbleData {
  label: string;
  value: number; // 비율
  color: string;
}

interface BubbleCategoryGraphProps {
  data: BubbleData[];
  centerLabel: string;
}

const RADIUS_SCALE = 2.5; // 비율에 따른 버블 크기 스케일
const CENTER_X = 180;
const CENTER_Y = 180;
const ANGLE_OFFSET = 360 / 10; // 최대 10개 기준 각도

export default function BubbleCategoryGraph({ data, centerLabel }: BubbleCategoryGraphProps) {
  const bubbles = data.map((item, index) => {
    const angle = (index * ANGLE_OFFSET * Math.PI) / 180;
    const x = CENTER_X + Math.cos(angle) * 100;
    const y = CENTER_Y + Math.sin(angle) * 100;
    const radius = Math.sqrt(item.value) * RADIUS_SCALE; // 루트 스케일링

    return (
      <React.Fragment key={item.label}>
        {/* 선 */}
        <Line
          x1={CENTER_X}
          y1={CENTER_Y}
          x2={x}
          y2={y}
          stroke={Colors.secondary}
          strokeWidth={1}
        />

        {/* 버블 */}
        <Circle cx={x} cy={y} r={radius} fill={item.color} />
        <Text
          style={{
            position: 'absolute',
            left: x - radius,
            top: y - radius / 2,
            width: radius * 2,
            textAlign: 'center',
            color: Colors.text,
            fontWeight: '600',
            fontSize: 12,
          }}
        >
          {item.label}\n({item.value.toFixed(1)}%)
        </Text>
      </React.Fragment>
    );
  });

  return (
    <View
      style={{
        backgroundColor: Colors.background,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* 중심 카테고리 */}
      <View
        style={{
          position: 'absolute',
          top: CENTER_Y - 30,
          left: CENTER_X - 30,
          width: 60,
          height: 60,
          backgroundColor: Colors.primary,
          borderRadius: 30,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <Text style={{ color: Colors.white, fontWeight: 'bold', fontSize: 14 }}>{centerLabel}</Text>
      </View>

      {/* SVG 버블들 */}
      <Svg height={360} width={360}>{bubbles}</Svg>
    </View>
  );
}
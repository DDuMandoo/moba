// components/chart/BubbleChart.tsx
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Text as SvgText, G } from 'react-native-svg';
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';

interface DataItem {
  category: string;
  amount: number;
}

interface Props {
  data: DataItem[];
}

export default function BubbleChart({ data }: Props) {
  const centerX = 150;
  const centerY = 150;
  const angleStep = (2 * Math.PI) / data.length;
  const radius = 90;

  const scaleSize = (amount: number) => 20 + Math.sqrt(amount) * 1.2;

  const colorPalette = [
    '#EFDAD0', '#F6E2DC', '#D8CAB8', '#F1E6DC', '#CBBFA5',
    '#E4D3C0', '#B5A08B', '#E8C7B8', '#C3D1C6', '#F9EDC6',
    '#DAD4E0', '#F3D7D7', '#D1E2E9', '#D8B8A5',
  ];

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg height="300" width="300">
        {/* 🔘 중앙 원 */}
        <Circle cx={centerX} cy={centerY} r={30} fill={Colors.secondary} />
        <SvgText
          x={centerX}
          y={centerY + 5}
          fontSize="13"
          fill={Colors.white}
          textAnchor="middle"
          fontFamily={Fonts.bold}
        >
          전체 소비
        </SvgText>

        {/* 🔵 주변 원 */}
        {data.map((item, index) => {
          const angle = angleStep * index;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          const r = scaleSize(item.amount);
          const fillColor = colorPalette[index % colorPalette.length];

          return (
            <G key={item.category}>
              <Circle cx={x} cy={y} r={r} fill={fillColor} />
              <SvgText
                x={x}
                y={y + 4}
                fontSize="13"
                fill={Colors.text}
                textAnchor="middle"
                fontFamily={Fonts.regular}
              >
                {item.category}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

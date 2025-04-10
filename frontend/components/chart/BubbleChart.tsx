import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Text as SvgText, G, Line } from 'react-native-svg';
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';

interface CenterCategory {
  category: string;
}

interface SubItem {
  category: string;
  ratio: number; // 퍼센트 (0~100)
}

interface Props {
  center: CenterCategory;
  subs: SubItem[];
}

export default function BubbleChart({ center, subs }: Props) {
  if (!subs || subs.length === 0) return null;

  const topSubs = [...subs].sort((a, b) => b.ratio - a.ratio).slice(0, 7);

  const SVG_SIZE = 300;
  const centerX = SVG_SIZE / 2;
  const centerY = SVG_SIZE / 2;
  const centerR = 28;
  const radius = 90;
  const angleStep = (2 * Math.PI) / topSubs.length;

  // ✅ 극한 과장 버전 (ratio⁵)
  const scaleSize = (ratio: number) => {
    const minR = 12;
    const maxR = 28;
    const normalized = ratio / 100;
    const exaggerated = Math.pow(normalized, 10);
    return minR + exaggerated * (maxR - minR);
  };

  const colorPalette = [
    '#FFC5C5', '#F8D7A3', '#B4E2D3', '#A7C7E7', '#E2B2FC',
    '#FCD6A4', '#C4E0B4',
  ];

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg height={SVG_SIZE} width={SVG_SIZE}>
        {/* 중심 원 */}
        <Circle cx={centerX} cy={centerY} r={centerR} fill={Colors.secondary} />
        <SvgText
          x={centerX}
          y={centerY + 5}
          fontSize="13"
          fill={Colors.white}
          textAnchor="middle"
          fontFamily={Fonts.bold}
        >
          {center.category}
        </SvgText>

        {/* 주변 원들 */}
        {topSubs.map((item, index) => {
          const angle = angleStep * index;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          const r = scaleSize(item.ratio); // ✅ 극단적 차이 적용

          const fillColor = colorPalette[index % colorPalette.length];

          const angleToPoint = Math.atan2(y - centerY, x - centerX);
          const lineStartX = centerX + centerR * Math.cos(angleToPoint);
          const lineStartY = centerY + centerR * Math.sin(angleToPoint);

          return (
            <G key={item.category}>
              {/* 연결선 */}
              <Line
                x1={lineStartX}
                y1={lineStartY}
                x2={x}
                y2={y}
                stroke={Colors.grayLightText}
                strokeWidth={1}
              />

              {/* 원 */}
              <Circle cx={x} cy={y} r={r} fill={fillColor} />

              {/* 카테고리 텍스트 */}
              <SvgText
                x={x}
                y={y - r - 6}
                fontSize="11"
                fill={Colors.text}
                textAnchor="middle"
                fontFamily={Fonts.regular}
              >
                {item.category.length > 8
                  ? `${item.category.slice(0, 6)}...`
                  : item.category}
              </SvgText>

              {/* 퍼센트 텍스트 */}
              <SvgText
                x={x}
                y={y + 4}
                fontSize="10"
                fill={Colors.grayDarkText}
                textAnchor="middle"
                fontFamily={Fonts.regular}
              >
                {`${item.ratio.toFixed(1)}%`}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

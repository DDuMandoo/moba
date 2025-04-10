import React, { useState } from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import Svg, { Rect, Text as SvgText, G, Line } from 'react-native-svg';
import Colors from '@/constants/Colors';

interface HourData {
  hour: number;
  amount: number;
}

interface Props {
  data: HourData[];
  yMin?: number;
  yMax?: number;
  yStep?: number;
}

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth * 1.2;
const chartHeight = 220;
const chartPadding = 30;
const barColor = Colors.primary;
const tooltipBg = Colors.white;

const groupByThreeHours = (data: HourData[]) => {
  const grouped = Array.from({ length: 8 }, (_, i) => ({
    label: `${i * 3}~${i * 3 + 2}시`,
    total: 0,
  }));

  data.forEach(({ hour, amount }) => {
    const index = Math.floor(hour / 3);
    grouped[index].total += amount;
  });

  return grouped;
};

export default function CustomBarChartWithTooltip({ data }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const grouped = groupByThreeHours(data);
  const values = grouped.map((d) => d.total);
  const labels = grouped.map((d) => d.label);

  const maxValue = Math.max(...values);
  const yMax = Math.ceil(maxValue / 100000) * 100000 || 100000;

  const barWidth = 18;
  const gap = 16;
  const scaleY = (amount: number) => (amount / yMax) * (chartHeight - chartPadding * 2);

  const yAxisSteps = 4;
  const yStepValue = yMax / yAxisSteps;

  return (
    <View style={{ marginTop: 20 }}>
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: Colors.text, textAlign: 'center' }}>
        시간대별 소비 금액 (3시간 단위)
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Y축 라벨 및 선 */}
          {[...Array(yAxisSteps + 1)].map((_, i) => {
            const y = chartHeight - chartPadding - (i * (chartHeight - chartPadding * 2)) / yAxisSteps;
            return (
              <G key={`y-label-${i}`}>
                <SvgText
                  x={0}
                  y={y + 4}
                  fontSize="9"
                  fill={Colors.grayDarkText}
                >
                  {(yStepValue * i).toLocaleString()}원
                </SvgText>
                <Line
                  x1={50}
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke={Colors.grayBackground}
                  strokeWidth={1}
                />
              </G>
            );
          })}

          {/* 툴팁은 모든 막대 위에 오도록 별도 렌더링 */}
          {selectedIndex !== null && (() => {
            const value = values[selectedIndex];
            const barHeight = scaleY(value);
            const x = 60 + selectedIndex * (barWidth + gap);
            const y = chartHeight - chartPadding - barHeight;
            const tooltipWidth = 80;
            const tooltipHeight = 24;
            const tooltipX = x + barWidth / 2 - tooltipWidth / 2;
            const tooltipY = y - tooltipHeight + 2; // 조금 더 아래로 조정

            const textX = tooltipX + tooltipWidth / 2;

            return (
              <G key="tooltip">
                <Rect
                  x={tooltipX}
                  y={tooltipY}
                  width={tooltipWidth}
                  height={tooltipHeight}
                  rx={6}
                  fill={tooltipBg}
                />
                <SvgText
                  x={textX}
                  y={tooltipY + 16}
                  fontSize="9"
                  fill={Colors.black}
                  textAnchor="middle"
                >
                  {`${value.toLocaleString()}원`}
                </SvgText>
              </G>
            );
          })()}

          {/* 막대 및 라벨 */}
          {values.map((value, i) => {
            const barHeight = scaleY(value);
            const x = 60 + i * (barWidth + gap);
            const y = chartHeight - chartPadding - barHeight;

            return (
              <G key={i}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={barColor}
                  rx={4}
                  onPress={() => setSelectedIndex(i)}
                />

                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight - 4}
                  fontSize="8"
                  fill={Colors.grayDarkText}
                  textAnchor="middle"
                >
                  {labels[i]}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </ScrollView>
    </View>
  );
}

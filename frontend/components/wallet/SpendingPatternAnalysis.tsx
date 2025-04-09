import React from 'react';
import { View } from 'react-native';
import HourlySpendingChart from './HourlySpendingChart';
import BubbleCategoryGraph from './BubbleCategoryGraph';
import Colors from '@/constants/Colors';

interface Props {
  hourlyStats: Record<string, number>;
  categoryRatio: Record<string, Record<string, number>>;
}

export default function SpendingPatternAnalysis({
  hourlyStats,
  categoryRatio,
}: Props) {
  // 가장 비중 높은 대분류만 선택 (행사 제외라고 가정)
  const topCategoryKey = Object.keys(categoryRatio).sort((a, b) => {
    const sumA = Object.values(categoryRatio[a]).reduce((acc, val) => acc + val, 0);
    const sumB = Object.values(categoryRatio[b]).reduce((acc, val) => acc + val, 0);
    return sumB - sumA;
  })[0];

  const bubbleData = Object.entries(categoryRatio[topCategoryKey] || {}).map(
    ([label, value], i) => ({
      label,
      value,
      color: [Colors.logo, Colors.secondary, Colors.logoInner][i % 3],
    })
  );

  return (
    <View style={{ marginTop: 16 }}>
      <HourlySpendingChart data={hourlyStats} />
      <View style={{ height: 32 }} />
      <BubbleCategoryGraph
        data={bubbleData}
        centerLabel={topCategoryKey}
      />
    </View>
  );
}

// components/chart/HourlySpendingChart.tsx

import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

interface HourData {
  hour: number;
  amount: number;
}

interface Props {
  data: HourData[];
}

const screenWidth = Dimensions.get('window').width;

export default function HourlySpendingChart({ data }: Props) {
  const labels = data.map((d) => `${d.hour}시`);
  const values = data.map((d) => d.amount);

  return (
    <View style={{ marginTop: 20 }}>
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>
        시간대별 소비 금액
      </Text>
      <BarChart
  data={{
    labels,
    datasets: [{ data: values }],
  }}
  width={screenWidth - 40}
  height={240}
  fromZero
  showValuesOnTopOfBars
  withInnerLines={false}
  yAxisLabel="" // ✅ 빈 문자열 or 단위 넣어줘야 함
  yAxisSuffix="원" // ✅ 선택적으로 원/k 등 단위
  chartConfig={{
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    fillShadowGradient: '#4F80FF',
    fillShadowGradientOpacity: 1,
    color: () => '#4F80FF',
    labelColor: () => '#333',
    propsForLabels: {
      fontSize: 10,
    },
    barPercentage: 0.5,
  }}
  style={{
    borderRadius: 12,
  }}
/>
    </View>
  );
}

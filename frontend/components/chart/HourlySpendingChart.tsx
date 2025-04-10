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

// 🔄 3시간 단위로 묶기
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

export default function HourlySpendingChart({ data }: Props) {
  const groupedData = groupByThreeHours(data);
  const labels = groupedData.map((d) => d.label);
  const values = groupedData.map((d) => d.total);

  return (
    <View style={{ marginTop: 20, alignItems: 'center' }}>
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>
        시간대별 소비 금액 (3시간 단위)
      </Text>
      <BarChart
        data={{
          labels,
          datasets: [{ data: values }],
        }}
        width={screenWidth * 0.85} // 🔽 너비 축소
        height={240}
        fromZero
        showValuesOnTopOfBars
        withInnerLines={false}
        yAxisLabel=""
        yAxisSuffix="원"
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
          barPercentage: 0.4, // 🔽 바 두께 줄이기
        }}
        style={{
          borderRadius: 12,
        }}
      />
    </View>
  );
}

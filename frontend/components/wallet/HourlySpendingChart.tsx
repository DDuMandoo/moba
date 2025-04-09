import React from 'react';
import { View, Text } from 'react-native';
import Colors from '@/constants/Colors';

interface HourlySpendingChartProps {
  data: Record<string, number>; // 시간대별 금액
}

export default function HourlySpendingChart({ data }: HourlySpendingChartProps) {
  const hourlyArray = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}시`,
    value: data[i.toString()] ?? 0,
  }));

  const values = hourlyArray.map((d) => d.value);
  const maxValue = values.length > 0 ? Math.max(...values) : 1;

  return (
    <View
      style={{
        backgroundColor: Colors.white,
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 12,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 12 }}>
        시간대별 소비 금액
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        {hourlyArray.map(({ hour, value }) => {
          const heightRatio = value / maxValue;
          return (
            <View key={hour} style={{ alignItems: 'center', width: 10 }}>
              <View
                style={{
                  height: heightRatio * 120,
                  width: 10,
                  backgroundColor: Colors.secondary,
                  borderRadius: 4,
                }}
              />
              <Text style={{ fontSize: 10, color: Colors.grayDarkText, marginTop: 4 }}>{hour}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Colors from '@/constants/Colors';
import BubbleChart from '@/components/chart/BubbleChart';

const TABS = [
  '전체',
  '음식점',
  '카페',
  '주점',
  '문화/여가',
  '운동',
  '행사',
];

const MOCK_DATA = {
  전체: [
    { category: '초콜릿', amount: 42.6 },
    { category: '젤리', amount: 10.4 },
    { category: '빵', amount: 42.6 },
  ],
  카페: [
    { category: '초콜릿', amount: 42.6 },
    { category: '젤리', amount: 10.4 },
    { category: '빵', amount: 42.6 },
  ],
  음식점: [],
  주점: [],
  '문화/여가': [],
  운동: [],
  행사: [],
};

export default function CommonInterestSection() {
  const [selectedTab, setSelectedTab] = useState('카페');

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.text }}>
        공통 관심사
      </Text>
      <Text style={{ color: Colors.grayLightText, marginTop: 4 }}>
        참가자들의 공통 관심사 분석 결과를 확인해보세요.
      </Text>

      {/* 탭 선택 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 16 }}
        contentContainerStyle={{ gap: 8 }}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={{
              borderWidth: 1,
              borderColor: Colors.primary,
              backgroundColor: selectedTab === tab ? Colors.primary : 'transparent',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                color: selectedTab === tab ? 'white' : Colors.primary,
                fontWeight: 'bold',
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 방사형 버블차트 */}
      <BubbleChart data={MOCK_DATA[selectedTab]} />
    </View>
  );
}

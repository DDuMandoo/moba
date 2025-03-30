import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import PromiseCard from '@/components/PromiseCard';
import Colors from '@/constants/Colors';

export default function SettlementHistoryPage() {
  // 🔁 임시 mock 데이터
  const mockData = [
    {
      appointmentId: 1,
      title: '알고리즘 스터디',
      imageUrl:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQul4bTIHNjv5EQGpXWc5KzPDi-fLdS6Z77A&usqp=CAU',
      time: '2025-04-11T18:30:00',
      amount: '50000',
      participants: [
        'https://avatars.githubusercontent.com/u/1?v=4',
        'https://avatars.githubusercontent.com/u/2?v=4',
        'https://avatars.githubusercontent.com/u/3?v=4',
        'https://avatars.githubusercontent.com/u/4?v=4',
      ],
    },
    {
      appointmentId: 2,
      title: 'A601',
      imageUrl:
        'https://cdn.class101.net/images/3f5f97f0-6bd7-4ef9-82b0-04fcdeec95bf',
      time: '2025-04-13T11:30:00',
      amount: '100000',
      participants: [
        'https://avatars.githubusercontent.com/u/4?v=4',
        'https://avatars.githubusercontent.com/u/3?v=4',
        'https://avatars.githubusercontent.com/u/2?v=4',
        'https://avatars.githubusercontent.com/u/1?v=4',
      ],
    },
    // 추가 데이터 생략...
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.grayBackground }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>정산 내역</Text>

      <View style={{ gap: 16 }}>
        {mockData.map((item) => (
          <PromiseCard key={item.appointmentId} {...item} />
        ))}
      </View>
    </ScrollView>
  );
}

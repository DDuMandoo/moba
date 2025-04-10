import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';

interface Props {
  rank: number;
  name: string;
  category: string;
}

export default function PlaceListItem({ rank, name, category }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.rankBox}>
        <Text style={styles.rank}>{rank}</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.category} numberOfLines={1}>{category}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8, // ↓ 더 조정
        paddingHorizontal: 14,
        backgroundColor: Colors.white,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
      },
      rankBox: {
        width: 26, // ↓ 조금 더 작게
        height: 26,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
      },
      rank: {
        fontFamily: Fonts.regular,
        fontSize: 13,
        color: Colors.primary,
      },
      infoBox: {
        flex: 1,
      },
      name: {
        fontFamily: Fonts.bold,
        fontSize: 14,
        color: Colors.text,
        marginBottom: 2, // 👈 이름과 카테고리 간 간격
      },
      category: {
        fontFamily: Fonts.regular,
        fontSize: 12,
        color: Colors.grayDarkText,
      },
});

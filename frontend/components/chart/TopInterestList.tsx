import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';

interface InterestItem {
  category: string;
  ratio: number;
}

interface Props {
  data: InterestItem[];
}

const medalEmojis = ['🥇', '🥈', '🥉'];
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function TopInterestList({ data }: Props) {
  if (!data || data.length === 0) return null;

  const sorted = [...data].sort((a, b) => b.ratio - a.ratio);
  const max = sorted[0].ratio;
  const min = sorted[sorted.length - 1].ratio;
  const range = max - min || 1;

  return (
    <View style={styles.container}>
      {sorted.map((item, index) => {
        const barRatio = (item.ratio - min) / range;
        const barWidth = Math.max(barRatio * SCREEN_WIDTH * 0.7, 20); // 최소 20px 보장
        const isTop = index < 3;

        return (
          <View key={item.category} style={styles.itemWrapper}>
            <View style={styles.labelBox}>
              <Text style={[styles.rank, isTop && styles.topRank]}>
                {medalEmojis[index] || `${index + 1}.`}
              </Text>
              <Text
                style={[styles.category, isTop && styles.topCategory]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.category}
              </Text>
            </View>
            <View style={styles.barBackground}>
              <View
                style={[
                  styles.barFill,
                  isTop && styles.barPrimary,
                  { width: barWidth },
                ]}
              />
            </View>
            <Text style={styles.score}>{item.ratio.toFixed(4)}점</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    gap: 12,
  },
  itemWrapper: {
    flexDirection: 'column',
  },
  labelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  rank: {
    fontSize: 16,
    color: Colors.grayDarkText,
    width: 28,
  },
  topRank: {
    fontSize: 18,
    color: Colors.primary,
  },
  category: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.text,
    maxWidth: '85%',
  },
  topCategory: {
    fontFamily: Fonts.bold,
  },
  barBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.grayDarkText,
    borderRadius: 6,
  },
  barPrimary: {
    backgroundColor: Colors.primary,
  },
  score: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.grayDarkText,
    fontFamily: Fonts.regular,
  },
});

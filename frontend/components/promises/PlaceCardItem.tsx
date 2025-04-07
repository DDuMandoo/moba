// components/promises/PlaceCardItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

interface Props {
  index: number;
  name: string;
  category: string;
  address: string;
}

export default function PlaceCardItem({ index, name, category, address }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.indexBox}>
        <Text style={styles.indexText}>{index}</Text>
      </View>
      <View style={styles.textBox}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.address} numberOfLines={1}>{address}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    gap: 15,
    marginBottom: 4,
  },
  indexBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  indexText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  textBox: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 17,
    color: Colors.black,
    fontWeight: '500',
  },
  category: {
    fontSize: 14,
    color: Colors.logo,
    fontWeight: '400',
  },
  address: {
    fontSize: 14,
    color: Colors.black,
  },
});

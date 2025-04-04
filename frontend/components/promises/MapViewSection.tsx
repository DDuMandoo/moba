import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

interface MapViewSectionProps {
  placeId: number;
  placeName: string;
  isHost: boolean;
}

const MapViewSection = ({ placeId, placeName, isHost }: MapViewSectionProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>선택된 장소</Text>
      <Text style={styles.placeName}>{placeName}</Text>
      <Text style={styles.placeId}>Place ID: {placeId}</Text>
      {isHost && <Text style={styles.hostNote}>※ 호스트만 장소를 수정할 수 있습니다.</Text>}
    </View>
  );
};

export default MapViewSection;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.text,
  },
  placeName: {
    fontSize: 14,
    color: Colors.primary,
  },
  placeId: {
    fontSize: 12,
    color: Colors.grayDarkText,
    marginTop: 4,
  },
  hostNote: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.secondary,
  },
});

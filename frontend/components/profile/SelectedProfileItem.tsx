// components/common/SelectedProfileItem.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  name: string;
  image?: string | null;
  onRemove?: () => void;
  size?: number; // 기본값: 60
}

const SelectedProfileItem = ({ name, image, onRemove, size = 60 }: Props) => {
  const imageSize = size * 0.8;
  const fontSize = size * 0.22;
  console.log(name, image)
  const resolvedSource =
    image && typeof image === 'string' && image.trim() !== ''
      ? { uri: image }
      : require('@/assets/images/defaultprofile.png');

  return (
    <View style={[styles.container, { width: size }]}>
      <View style={styles.imageWrap}>
        <Image
          source={resolvedSource}
          style={{
            width: imageSize,
            height: imageSize,
            borderRadius: imageSize * 0.28,
            borderWidth: 1,
            borderColor: Colors.logo,
          }}
        />
        {onRemove && (
          <TouchableOpacity style={styles.removeIcon} onPress={onRemove}>
            <Ionicons name="remove" size={14} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.name,
          {
            fontSize,
            marginTop: size * 0.05,
          },
        ]}
      >
        {name}
      </Text>
    </View>
  );
};

export default SelectedProfileItem;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  imageWrap: {
    position: 'relative',
  },
  removeIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  name: {
    color: Colors.black,
    textAlign: 'center',
  },
});

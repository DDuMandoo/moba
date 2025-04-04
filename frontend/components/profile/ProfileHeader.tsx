import React, { useState } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

interface Props {
  name: string;
  image: string;
  isLoading: boolean;
  isError: boolean;
  titleFormat?: (name: string) => string;
}

export default function ProfileHeader({
  name,
  image,
  isLoading,
  isError,
  titleFormat,
}: Props) {
  const [imgError, setImgError] = useState(false);
  const size = 68;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (isError || !name || name.trim() === '') {
    return (
      <Text style={styles.errorText}>
        유저 정보를 불러올 수 없습니다.
      </Text>
    );
  }

  const displayName = titleFormat ? titleFormat(name) : name;

  return (
    <View style={styles.row}>
      <View style={[styles.imageBox, { width: size, height: size, borderRadius: size * 0.3 }]}>
        <Image
          source={
            !image || image.trim() === '' || imgError
              ? require('@/assets/images/defaultprofile.png')
              : { uri: image }
          }
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', borderRadius: size * 0.25 }}
        />
      </View>
      <Text style={[styles.name, { fontSize: size * 0.36 }]}>
        {displayName}
        <Text style={[styles.suffix, { fontSize: size * 0.28 }]}> 님</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  imageBox: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.logoInner,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    color: Colors.black,
    fontFamily: 'NanumSquareRound',
  },
  suffix: {
    color: Colors.black,
    fontFamily: 'NanumSquareRound',
  },
  centered: {
    alignItems: 'center',
    marginVertical: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.grayDarkText,
    textAlign: 'center',
  },
});

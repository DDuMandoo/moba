import React, { useState } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

interface DelegateProfileProps {
  name: string;
  image: string;
  size?: number;
}

export default function DelegateProfile({
  name,
  image,
  size =20, // 기본 크기를 40으로 설정 (원하는 크기로 조정 가능)
}: DelegateProfileProps) {
  const [imgError, setImgError] = useState(false);

  if (!name || name.trim() === '') {
    return (
      <Text style={styles.errorText}>
        참가자 정보를 불러올 수 없습니다.
      </Text>
    );
  }

  return (
    <View style={[styles.row, { gap: size * 0.2 }]}>
      <View
        style={[
          styles.imageBox,
          { width: size, height: size, borderRadius: size * 0.3 },
        ]}
      >
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
        {name}
        <Text style={[styles.suffix, { fontSize: size * 0.28 }]}> 님</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.grayDarkText,
    textAlign: 'center',
  },
});

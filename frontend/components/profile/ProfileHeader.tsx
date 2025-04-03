import React, { useState } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import Colors from '@/constants/Colors';

interface Props {
  name: string;
  image: string;
  isLoading: boolean;
  isError: boolean;
  titleFormat?: (name: string) => string; // ✅ 포맷 함수
}

export default function ProfileHeader({
  name,
  image,
  isLoading,
  isError,
  titleFormat,
}: Props) {
  const [imgError, setImgError] = useState(false);

  if (isLoading) {
    return (
      <View style={{ alignItems: 'center', marginVertical: 20 }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (isError || !name || name.trim() === '') {
    return (
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.grayDarkText }}>
        유저 정보를 불러올 수 없습니다.
      </Text>
    );
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
      <Image
        source={
          !image || image.trim() === '' || imgError
            ? require('@/assets/images/defaultprofile.png')
            : { uri: image }
        }
        onError={() => setImgError(true)}
        style={{
          width: 56,
          height: 56,
          borderRadius: 20,
          backgroundColor: Colors.grayLightText,
          marginRight: 12,
        }}
      />
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text }}>
        {titleFormat ? titleFormat(name) : name}
      </Text>
    </View>
  );
}

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

interface ProfileWithEmailProps {
  name: string;
  email: string;
  imageUri: string;
  size?: number;
}

export default function ProfileWithEmail({ name, email, imageUri, size = 68 }: ProfileWithEmailProps) {
  const emailId = email.split('@')[0];

  return (
    <View style={[styles.container, { height: size }]}>
      <View style={[styles.imageBox, { width: size, height: size, borderRadius: size * 0.3 }]}>
        <Image
          source={imageUri ? { uri: imageUri } : require('@/assets/images/defaultprofile.png')}
          style={{ width: '100%', height: '100%', borderRadius: size * 0.25 }}
        />
      </View>
      <View style={[styles.textContainer, { height: size }]}>
        <Text style={[styles.name, { fontSize: size * 0.36 }]}>
          {name}
          <Text style={[styles.suffix, { fontSize: size * 0.28 }]}> 님</Text>
        </Text>
        <Text style={[styles.emailId, { fontSize: size * 0.3, marginTop: size*0.04 }]}>@{emailId}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  imageBox: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.logoInner,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    justifyContent: 'center',
  },
  name: {
    color: Colors.black,
    fontFamily: 'NanumSquareRound',
  },
  suffix: {
    color: Colors.black,
    fontFamily: 'NanumSquareRound',
  },
  emailId: {
    color: Colors.grayDarkText,
    fontFamily: 'NanumSquareRound',
  },
});

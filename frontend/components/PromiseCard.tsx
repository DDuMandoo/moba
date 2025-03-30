import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { format, parseISO, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useRouter } from 'expo-router';

interface Props {
  appointmentId: number;
  imageUrl: string;
  title: string;
  time: string;
  location?: string;
  amount?: string;
  participants: string[];
}

export default function PromiseCard({
  appointmentId,
  imageUrl,
  title,
  time,
  location,
  amount,
  participants
}: Props) {
  const router = useRouter();
  const displayExtraInfo = location || amount;

  // ✅ 날짜 포맷 처리
  let formattedTime = '포맷안됨';
  try {
    const date = new Date(time);
    if (!isNaN(date.getTime())) {
      formattedTime = date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
  } catch {
    formattedTime = '-';
  }

  const handlePress = () => {
    router.push({
      pathname: '/promises/[id]',
      params: { id: String(appointmentId) }
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.container}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.row}>
            <Feather name="clock" size={16} color={Colors.black} />
            <Text style={styles.metaText}>{formattedTime}</Text>
          </View>

          {displayExtraInfo && (
            <View style={styles.row}>
              <Feather
                name={location ? 'map' : 'credit-card'}
                size={16}
                color={Colors.black}
              />
              <Text style={styles.metaText}>
                {location ? location : `${Number(amount).toLocaleString()}원`}
              </Text>
            </View>
          )}

          <View style={styles.participantsRow}>
            <Feather name="users" size={16} color={Colors.black} style={{ marginRight: 8 }} />
            <View style={styles.profileGroup}>
              {participants.map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.profileImage} />
              ))}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: '5%',
    gap: 15,
    backgroundColor: Colors.white,
    borderRadius: 10
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 10
  },
  content: {
    flex: 1,
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.black
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4
  },
  metaText: {
    fontSize: 16,
    color: Colors.black
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },
  profileGroup: {
    flexDirection: 'row',
    gap: 5
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 0.4,
    borderColor: Colors.logo
  }
});

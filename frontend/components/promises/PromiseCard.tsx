import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import axiosInstance from '@/app/axiosInstance';

interface Participant {
  memberId: number;
  name: string;
  profileImage: string | null;
}

interface Props {
  imageUrl: string | null;
  title: string;
  time: string;
  location?: string | null;
  amount?: string;
  appointmentId: number;
  onPress?: () => void;
}

export default function PromiseCard({
  imageUrl,
  title,
  time,
  location,
  amount,
  appointmentId,
  onPress,
}: Props) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const res = await axiosInstance.get(`/appointments/${appointmentId}/participants`);
        const participants = res.data.result?.participants ?? [];
        setParticipants(participants);
      } catch (err: any) {
        console.error('❌ 참가자 정보 로딩 실패:', err?.response?.data || err.message);
      }
    };
    fetchParticipants();
  }, [appointmentId]);

  const formattedTime = (() => {
    try {
      const date = new Date(time);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      }
    } catch {}
    return '-';
  })();

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
        <Image
          source={
            imageUrl
              ? { uri: imageUrl }
              : require('@/assets/images/defaultpromise.png')
          }
          style={styles.image}
        />

        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.metaRow}>
            <Feather name="clock" size={16} color={Colors.black} />
            <Text style={styles.metaText}>{formattedTime}</Text>
          </View>

          {location && (
            <View style={styles.metaRow}>
              <Feather name="map" size={16} color={Colors.black} />
              <Text style={styles.metaText}>{location}</Text>
            </View>
          )}

          {amount && (
            <View style={styles.metaRow}>
              <Feather name="credit-card" size={16} color={Colors.black} />
              <Text style={styles.metaText}>{`${Number(amount).toLocaleString()}원`}</Text>
            </View>
          )}

          <View style={styles.participantsRow}>
            <Feather name="users" size={16} color={Colors.black} />
            <View style={styles.profileGroup}>
              {participants.map((p, index) => (
                <Image
                  key={p.memberId ?? index}
                  source={
                    p.profileImage
                      ? { uri: p.profileImage }
                      : require('@/assets/images/defaultprofile.png')
                  }
                  style={styles.profileImage}
                />
              ))}
            </View>
          </View>
        </View>

        <Feather name="chevron-right" size={20} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 12,
    backgroundColor: Colors.white,
    padding: 12,
    marginBottom: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    height: 88,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 14,
    color: Colors.black,
    marginLeft: 6,
    lineHeight: 18,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  profileGroup: {
    flexDirection: 'row',
    marginLeft: 2,
    gap: 5,
  },
  profileImage: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 0.4,
    borderColor: Colors.logo,
    backgroundColor: Colors.grayLightText,
  },
});

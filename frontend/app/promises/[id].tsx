import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axiosInstance from '@/app/axiosInstance';
import Colors from '@/constants/Colors';
import LoadingModal from '@/components/modal/LoadingModal';
import { Feather } from '@expo/vector-icons';

export default function PromiseDetailScreen() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromise = async () => {
      try {
        const res = await axiosInstance.get(`/appointments/${id}`);
        setData(res.data.result);
      } catch (err) {
        console.error('❌ 약속 정보 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPromise();
  }, [id]);

  if (loading) return <LoadingModal visible />;
  if (!data) return <Text style={{ padding: 20 }}>데이터를 불러오지 못했어요 😢</Text>;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: data.imageUrl }} style={styles.image} />

      <Text style={styles.title}>{data.name}</Text>

      <View style={styles.row}>
        <Feather name="clock" size={18} color={Colors.black} />
        <Text style={styles.info}>{data.time}</Text>
      </View>

      {data.location && (
        <View style={styles.row}>
          <Feather name="map-pin" size={18} color={Colors.black} />
          <Text style={styles.info}>{data.location}</Text>
        </View>
      )}

      {data.amount && (
        <View style={styles.row}>
          <Feather name="credit-card" size={18} color={Colors.black} />
          <Text style={styles.info}>{Number(data.amount).toLocaleString()}원</Text>
        </View>
      )}

      <Text style={[styles.subtitle, { marginTop: 20 }]}>참가자</Text>
      <View style={styles.participants}>
        {data.participants.map((uri: string, i: number) => (
          <Image key={i} source={{ uri }} style={styles.avatar} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    padding: 20
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 12
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8
  },
  info: {
    fontSize: 16,
    color: Colors.black
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 8
  },
  participants: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.grayLightText
  }
});

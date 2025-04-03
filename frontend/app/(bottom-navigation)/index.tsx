import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import WalletStatus from '@/components/WalletStatus';
import Colors from '@/constants/Colors';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchUserProfile } from '@/redux/slices/userSlice';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PromiseCard from '@/components/PromiseCard';
import axiosInstance from '@/app/axiosInstance';
import { useRouter } from 'expo-router';

export default function WalletDetailPage() {
  const dispatch = useAppDispatch();
  const { profile, isLoading, isError } = useAppSelector((state) => state.user);
  const [promiseList, setPromiseList] = useState<any[]>([]);
  const [participantsMap, setParticipantsMap] = useState<Record<number, { profileImage: string | null }[]>>({});
  const router = useRouter();

  // ✅ 1. 유저 프로필 요청 시작
  useEffect(() => {
    console.log('🔥 dispatching fetchUserProfile()');
    dispatch(fetchUserProfile());
  }, []);

  // ✅ 2. 상태 변화 추적
  useEffect(() => {
    console.log('👤 profile 상태 변경됨:', profile);
    console.log('📦 isLoading:', isLoading);
    console.log('❗ isError:', isError);
  }, [profile, isLoading, isError]);

  // ✅ 3. 프로필 준비 완료 후 약속 목록 요청
  useEffect(() => {
    const isProfileReady = profile?.email && !isLoading && !isError;

    console.log('🧪 조건 체크 →', {
      'profile?.email': profile?.email,
      isLoading,
      isError,
      isProfileReady,
    });

    if (!isProfileReady) {
      console.log('⛔ 약속 목록 요청 취소됨 (조건 불충분)');
      return;
    }

    const fetchPromises = async () => {
      try {
        console.log('🚀 약속 목록 요청 시작');

        const res = await axiosInstance.get('/appointments/me');
        console.log('✅ 약속 목록 응답:', res.data);

        const promises = res.data.result || [];
        setPromiseList(promises);

        const promisesWithParticipants = await Promise.all(
          promises.map(async (p: any) => {
            try {
              const res = await axiosInstance.get(`/appointments/${p.id}/participants`);
              return {
                appointmentId: p.id,
                participants: res.data.result.participants,
              };
            } catch (e) {
              console.error(`❌ 참가자 목록 불러오기 실패: ${p.id}`, e);
              return { appointmentId: p.id, participants: [] };
            }
          })
        );

        const map: Record<number, { profileImage: string | null }[]> = {};
        promisesWithParticipants.forEach((item) => {
          map[item.appointmentId] = item.participants;
        });
        setParticipantsMap(map);
      } catch (err: any) {
        console.error('❌ 약속 목록 불러오기 실패:', err?.response?.data?.message || err.message);
      }
    };

    fetchPromises();
  }, [profile?.email, isLoading, isError]);

  // ✅ 4. 로딩 중 표시
  if (isLoading || !profile?.email) {
    console.log('⏳ 로딩 중... profile이나 email 없음');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 10, color: Colors.text }}>로딩 중...</Text>
      </View>
    );
  }

  // ✅ 5. 메인 렌더링
  return (
    <ScrollView
      style={{ backgroundColor: Colors.background }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
    >
      {/* 프로필 */}
      <ProfileHeader
        name={profile.name}
        image={profile.image}
        isLoading={isLoading}
        isError={isError}
      />

      {/* 지갑 상태 */}
      <View style={{ alignItems: 'center', width: '100%', marginTop: 24 }}>
        <WalletStatus />
      </View>

      {/* 내 약속 */}
      <View style={{
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        marginTop: 24,
      }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text }}>
          내 약속
        </Text>
        <View style={{ marginTop: 12 }}>
          {promiseList.map((p) => (
            <PromiseCard
              key={p.id}
              appointmentId={p.id}
              imageUrl={p.imageUrl}
              title={p.title}
              time={p.time}
              location={p.location}
              amount={p.amount}
              participants={participantsMap[p.id] || []}
              onPress={() => router.push(`/promises/${String(p.id)}`)}
            />
          ))}
        </View>
      </View>

      {/* 소비 패턴 분석 */}
      <View style={{
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
      }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text }}>
          내 소비 패턴 분석
        </Text>
      </View>
    </ScrollView>
  );
}

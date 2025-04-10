import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import ProfileWithEmail from '@/components/profile/ProfileWithEmail';
import PromiseCard from '@/components/promises/PromiseCard';
import SettingsOverlay from '@/components/modal/SettingOverlay';
import ConfirmPasswordModal from '@/components/modal/ConfilmPasswordModal';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchUserProfile } from '@/redux/slices/userSlice';
import { useRouter, useFocusEffect } from 'expo-router';
import axiosInstance from '@/app/axiosInstance';

const tabs = ['전체', '진행중/예정', '종료'] as const;

export default function MyPageScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.profile);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalAttendanceCount: 0, totalSpent: 0 });
  const [selectedTab, setSelectedTab] = useState<typeof tabs[number]>('진행중/예정');
  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([]);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const underlineX = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;

  const fetchSummaryAndAppointments = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    try {
      const [appointmentsRes, summaryRes] = await Promise.all([
        axiosInstance.get('/appointments'),
        axiosInstance.get(`/appointments/summary?year=${year}&month=${month}`)
      ]);
      setAppointments(appointmentsRes.data.result || []);
      setSummary(summaryRes.data.result || { totalAttendanceCount: 0, totalSpent: 0 });
    } catch (err) {
      console.error('❌ 데이터 불러오기 실패', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSummaryAndAppointments();
    dispatch(fetchUserProfile()); // 혹시 user 정보도 갱신 필요할 수 있음
    setRefreshing(false);
  };

  useEffect(() => {
    if (!user) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, user]);

  useEffect(() => {
    fetchSummaryAndAppointments();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSummaryAndAppointments();
    }, [])
  );

  const filteredPromises = appointments.filter((p) => {
    if (selectedTab === '전체') return true;
    if (selectedTab === '진행중/예정') return !p.isEnded;
    if (selectedTab === '종료') return p.isEnded;
  });

  const handleTabPress = (tab: typeof tabs[number], index: number) => {
    setSelectedTab(tab);
    const layout = tabLayouts[index];
    if (!layout) return;

    Animated.parallel([
      Animated.timing(underlineX, {
        toValue: layout.x,
        duration: 200,
        useNativeDriver: false
      }),
      Animated.timing(underlineWidth, {
        toValue: layout.width,
        duration: 200,
        useNativeDriver: false
      })
    ]).start();
  };

  const handleTabLayout = (e: LayoutChangeEvent, index: number) => {
    const { x, width } = e.nativeEvent.layout;
    setTabLayouts((prev) => {
      const copy = [...prev];
      copy[index] = { x, width };
      return copy;
    });
  };
  
  if (!user || appointments.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }
  

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 상단 섹션 */}
        <View style={styles.topSection}>
          <View style={styles.profileBox}>
            {user && (
              <ProfileWithEmail name={user.name} email={user.email} imageUri={user.image} />
            )}
          </View>

          {/* 설정 아이콘 */}
          <TouchableOpacity onPress={() => setOverlayVisible(true)}>
            <Ionicons name="settings-outline" size={28} color={Colors.logo} />
          </TouchableOpacity>
        </View>

        {/* 요약 카드 */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Ionicons name="checkbox" size={20} color={Colors.logo} />
            <Text style={styles.summaryText}>
              이번달에 <Text style={styles.bold}>{summary.totalAttendanceCount}</Text>번의 모임에 참여하셨어요.
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="checkbox" size={20} color={Colors.logo} />
            <Text style={styles.summaryText}>
              이번달 약속에 <Text style={styles.bold}>{summary.totalSpent.toLocaleString()}원</Text>을 소비했습니다.
            </Text>
          </View>
        </View>

        {/* 나의 모임 */}
        <Text style={styles.sectionTitle}>나의 모임</Text>

        {/* 탭 필터 */}
        <View style={styles.tabWrapper}>
          <View style={styles.tabBar}>
            {tabs.map((tab, i) => (
              <TouchableOpacity
                key={tab}
                onPress={() => handleTabPress(tab, i)}
                onLayout={(e) => handleTabLayout(e, i)}
              >
                <Text style={[styles.tabText, selectedTab === tab && styles.tabSelected]}>
                  · {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 약속 카드 리스트 */}
        <View style={styles.promiseList}>
          {filteredPromises.map((promise) => (
            <PromiseCard
              key={promise.appointmentId}
              appointmentId={promise.appointmentId}
              imageUrl={promise.imageUrl}
              title={promise.name}
              time={promise.time}
              location={promise.placeName}
              onPress={() =>
                router.push({
                  pathname: promise.isEnded ? '/promises/[id]/ended' : '/promises/[id]',
                  params: { id: String(promise.appointmentId) }
                })
              }
            />
          ))}
        </View>
      </ScrollView>

      <SettingsOverlay
        visible={overlayVisible}
        onClose={() => setOverlayVisible(false)}
        onEditProfile={() => {
          setOverlayVisible(false);
          setTimeout(() => {
            setShowConfirmModal(true);
          }, 300);
        }}
      />

      <ConfirmPasswordModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          setShowConfirmModal(false);
          router.push('/auth/profile-edit');
        }}
        userId={user?.email || ''}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    padding: 20
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  profileBox: {
    flex: 1
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 15,
    elevation: 2
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 2,
    color: Colors.black,
    flexShrink: 1
  },
  bold: {
    fontWeight: 'bold',
    fontSize: 20,
    color: Colors.logo
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 10,
    marginTop: 5,
    marginLeft: 4
  },
  tabWrapper: {
    position: 'relative',
    marginBottom: 10
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  tabText: {
    fontSize: 16,
    color: '#888'
  },
  tabSelected: {
    color: Colors.logo,
    fontWeight: 'bold'
  },
  promiseList: {
    gap: 1,
    marginBottom: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.text,
  },
  
});

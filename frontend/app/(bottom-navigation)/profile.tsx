import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import axiosInstance from '@/app/axiosInstance';
import Constants from 'expo-constants';
import ProfileWithEmail from '@/components/profile/ProfileWithEmail';
import PromiseCard from '@/components/PromiseCard';
import SettingsOverlay from '@/components/overlays/SettingOverlay';

import { dummyPromises } from '@/constants/dummy/dummyPromises';

const BASE_URL = Constants.expoConfig?.extra?.API_URL;

const tabs = ['전체', '진행중/예정', '종료'] as const;

export default function MyPageScreen() {
  const [user, setUser] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<typeof tabs[number]>('전체');
  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([]);
  const [overlayVisible, setOverlayVisible] = useState(false);

  const underlineX = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;

  const filteredPromises = dummyPromises.filter((p) => {
    if (selectedTab === '전체') return true;
    if (selectedTab === '진행중/예정') return !p.isEnded;
    if (selectedTab === '종료') return p.isEnded;
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`${BASE_URL}/members`);
        setUser(res.data.result);
      } catch (e) {
        console.error('❌ 유저 정보 불러오기 실패', e);
      }
    };
    fetchUser();
  }, []);

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

  return (
    <ScrollView style={styles.container}>
      {/* 프로필 */}
      <View style={styles.topSection}>
        <View style={styles.profileBox}>
          {user && (
            <ProfileWithEmail
              name={user.name}
              email={user.email}
              imageUri={user.image}
            />
          )}
        </View>
        <TouchableOpacity onPress={() => setOverlayVisible(true)} style={styles.settingIcon}>
          <Ionicons name="settings-outline" size={28} color={Colors.logo} />
        </TouchableOpacity>

        <SettingsOverlay visible={overlayVisible} onClose={() => setOverlayVisible(false)} />
      </View>

      {/* 요약 카드 */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Ionicons name="checkbox" size={20} color={Colors.logo} />
          <Text style={styles.summaryText}>
            이번달에 <Text style={styles.bold}>3</Text>번의 모임에 참여하셨어요.
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Ionicons name="checkbox" size={20} color={Colors.logo} />
          <Text style={styles.summaryText}>
            이번달 약속에 <Text style={styles.bold}>245,000원</Text>을 소비했습니다.
          </Text>
        </View>
      </View>

      {/* 나의 모임 제목 */}
      <Text style={styles.sectionTitle}>나의 모임</Text>

      {/* 필터 탭 */}
      <View style={styles.tabWrapper}>
        <View style={styles.tabBar}>
          {tabs.map((tab, i) => (
            <TouchableOpacity
              key={tab}
              onPress={() => handleTabPress(tab, i)}
              onLayout={(e) => handleTabLayout(e, i)}
              style={styles.tabItem}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabSelected]}>
                · {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tabLayouts.length === tabs.length && (
          <Animated.View
            style={[
              {
                left: underlineX,
                width: underlineWidth
              }
            ]}
          />
        )}
      </View>

      {/* 약속 리스트 */}
      <View style={styles.promiseList}>
        {filteredPromises.map((promise) => (
          <PromiseCard
            key={promise.appointmentId}
            appointmentId={promise.appointmentId}
            imageUrl={promise.imageUrl}
            title={promise.name}
            time={promise.time}
            location={promise.location}
            participants={promise.participants}
          />
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
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  profileBox: {
    flex: 1
  },
  settingIcon: {
    padding: 8
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 20,
    elevation: 2
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8
  },
  summaryText: {
    fontSize: 18,
    color: Colors.black,
    flexShrink: 1,
    textAlignVertical: 'center'
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
    marginBottom: 16
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  tabItem: {},
  tabText: {
    fontSize: 16,
    color: '#888'
  },
  tabSelected: {
    color: Colors.logo,
    fontWeight: 'bold'
  },
  promiseList: {
    gap: 16
  }
});

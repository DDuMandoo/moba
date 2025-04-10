import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';
import BubbleChart from '@/components/chart/BubbleChart';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { setRecommendation } from '@/redux/slices/mydataSlice';
import axiosInstance from '@/app/axiosInstance';
import { useLocalSearchParams } from 'expo-router';
import LoadingModal from '@/components/modal/LoadingModal';

const { width } = Dimensions.get('window');

const CATEGORY_LABELS: Record<string, string> = {
  food: '음식점',
  cafe: '카페',
  pub: '주점',
  leisure: '문화/여가',
  sports: '운동',
  event: '행사',
};

export default function CommonInterestSection() {
  const { id: appointmentId } = useLocalSearchParams<{ id?: string }>();
  const dispatch = useAppDispatch();
  const [selectedTab, setSelectedTab] = useState('cafe');
  const [places, setPlaces] = useState<any[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);

  const interestData = useAppSelector(
    (state) => state.mydata?.recommendation?.recommendedSubcategories ?? {}
  );

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const idNum = Number(appointmentId);
        if (!idNum) throw new Error('잘못된 약속 ID');

        const res = await axiosInstance.post(`/appointments/${idNum}/recommendations`, {});
        dispatch(setRecommendation(res.data.result));
      } catch (err) {
        console.error('❌ 추천 데이터 로드 실패:', err);
      }
    };

    if (appointmentId) fetchRecommendations();
  }, [appointmentId]);

  useEffect(() => {
    const fetchPlacesOnce = async () => {
      const idNum = Number(appointmentId);
      if (!idNum || selectedTab === 'event') return;

      setIsLoadingPlaces(true);
      try {
        const url = `/appointments/${idNum}/recommendations/places?category=${selectedTab}`;
        const res = await axiosInstance.post(url, {});

        const code = res?.data?.code;
        if (code === 4416) {
          return;
        }

        const placesData = res.data.result?.recommendedSubcategories?.[selectedTab] || [];
        setPlaces(placesData);
      } catch (err: any) {
        console.error('❌ 장소 데이터 로드 실패:', err);
      } finally {
        setIsLoadingPlaces(false);
      }
    };

    fetchPlacesOnce();
  }, [appointmentId, selectedTab]);

  const categoryKeys = useMemo(() => Object.keys(interestData), [interestData]);

  const center = useMemo(
    () => ({
      category: CATEGORY_LABELS[selectedTab] || selectedTab,
    }),
    [selectedTab]
  );

  const subs = useMemo(
    () =>
      (interestData[selectedTab] ?? []).map(
        (item: { subcategory: string; score: number }) => {
          const ratio =
            item.score === 100 ? 100 : Math.round(item.score * 0.95 * 10) / 10;
          return {
            category: item.subcategory,
            ratio,
          };
        }
      ),
    [interestData, selectedTab]
  );

  return (
    <View style={styles.wrapper}>
      <LoadingModal visible={isLoadingPlaces} />

      <Text style={styles.title}>공통 관심사</Text>
      <Text style={styles.subtitle}>
        참가자들의 공통 관심사 분석 결과를 확인해보세요.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}
      >
        {categoryKeys.map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => setSelectedTab(key)}
            style={[styles.tab, selectedTab === key && styles.activeTab]}
          >
            <Text style={[styles.tabText, selectedTab === key && styles.activeTabText]}>
              {CATEGORY_LABELS[key] ?? key}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.chartBox}>
        {subs.length > 0 ? (
          <BubbleChart center={center} subs={subs} />
        ) : (
          <Text style={styles.emptyText}>해당 카테고리에 대한 데이터가 없습니다.</Text>
        )}
      </View>

      {!isLoadingPlaces && places.length > 0 && (
        <View style={{ marginTop: 24, gap: 10 }}>
          <Text style={styles.title}>{CATEGORY_LABELS[selectedTab]} 추천 장소</Text>
          {places.map((place, index) => (
            <TouchableOpacity
              key={place.placeId ?? place.id}
              activeOpacity={0.8}
              onPress={() => Linking.openURL(`https://place.map.kakao.com/${place.placeId}`)}
              style={styles.card}
            >
              <View style={styles.rankBox}>
                <Text style={styles.rank}>{index + 1}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.placeName}>{place.name}</Text>
                <Text style={styles.placeCategory}>{place.subcategory}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!isLoadingPlaces && places.length === 0 && (
        <Text style={styles.emptyText}>
          장소 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.grayLightText,
    fontFamily: Fonts.regular,
  },
  tabContainer: {
    marginTop: 12,
    gap: 8,
    paddingBottom: 8,
  },
  tab: {
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.primary,
  },
  activeTabText: {
    color: 'white',
  },
  chartBox: {
    marginTop: 16,
    width: width * 0.9,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    backgroundColor: Colors.white,
    height: 300,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.grayLightText,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    marginTop: 16,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
    color: Colors.grayLightText,
    fontFamily: Fonts.regular,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  rankBox: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rank: {
    fontFamily: Fonts.regular,
    color: Colors.primary,
  },
  infoBox: {
    flex: 1,
  },
  placeName: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.text,
  },
  placeCategory: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.grayDarkText,
    marginTop: 2,
  },
});
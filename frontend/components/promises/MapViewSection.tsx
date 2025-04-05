import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import Colors from '@/constants/Colors';

interface MapViewSectionProps {
  appointmentId: number;
  placeId?: string;
  placeName?: string;
  isHost: boolean;
}

export default function MapViewSection({
  placeName,
  isHost,
}: MapViewSectionProps) {
  const KAKAO_API_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY;

  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          html, body, #map {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
          }
        </style>
        <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&autoload=false"></script>
        <script>
          window.onload = function () {
            kakao.maps.load(function () {
              var container = document.getElementById('map');
              var options = {
                center: new kakao.maps.LatLng(37.5665, 126.9780),
                level: 3
              };
              var map = new kakao.maps.Map(container, options);
              var marker = new kakao.maps.Marker({
                position: map.getCenter(),
                map: map
              });
            });
          };
        </script>
      </head>
      <body>
        <div id="map"></div>
      </body>
    </html>
  `;

  return (
    <View style={styles.wrapper}>
      {/* 지도: 고정 높이 */}
      <View style={styles.mapBox}>
        <WebView
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          mixedContentMode="always"
          style={{ flex: 1 }}
        />
      </View>

      {/* 아래 정보: 스크롤 가능 */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>약속 장소</Text>

        {placeName && <Text style={styles.placeName}>📍 {placeName}</Text>}

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>
            {isHost
              ? '약속 장소는 호스트만 수정할 수 있어요.'
              : '호스트가 지정한 장소를 확인해 주세요.'}
          </Text>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>약속 장소 목록</Text>
          <Text style={styles.subText}>약속에서 방문할 장소들을 추가해보세요.</Text>
          <Text style={styles.listItem}>1. 스타벅스 강남대로점</Text>
          <Text style={styles.listItem}>카페 / 서울 강남구 대현길 218</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  mapBox: {
    width: '100%',
    height: 240,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
    gap: 14,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
  },
  descriptionBox: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  listSection: {
    gap: 6,
  },
  listItem: {
    fontSize: 15,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subText: {
    fontSize: 14,
    color: Colors.grayDarkText,
  },
});
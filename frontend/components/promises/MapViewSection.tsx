import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';

interface MapViewSectionProps {
  appointmentId: number;
  placeId?: string;
  placeName?: string;
  isHost: boolean;
}

export default function MapViewSection({
  appointmentId,
  placeId,
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
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>약속 장소</Text>

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

      {placeName && <Text style={styles.placeName}>📍 {placeName}</Text>}

      <View style={styles.descriptionBox}>
        <Text style={styles.descriptionText}>
          {isHost
            ? '약속 장소는 호스트만 수정할 수 있어요.'
            : '호스트가 지정한 장소를 확인해 주세요.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  mapBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#eee',
    marginBottom: 16,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    marginBottom: 12,
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
});

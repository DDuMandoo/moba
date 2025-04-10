import React, { useState } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Platform,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PinballGameScreen() {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
      <WebView
        source={{ uri: 'https://lazygyu.github.io/roulette/' }}
        onLoadEnd={() => setIsLoading(false)}
        startInLoadingState
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        userAgent={
          Platform.OS === 'android'
            ? 'Mozilla/5.0 (Linux; Android 10)'
            : 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
        }
        allowsBackForwardNavigationGestures
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

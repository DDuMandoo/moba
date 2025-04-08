import 'dotenv/config';

export default {
  expo: {
    name: '모여바라',
    slug: 'frontend',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icons/header/Logo.png',
    scheme: 'myapp',
    deeplink: true,
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    owner: 'keon21',
    ios: {
      supportsTablet: true
    },
    android: {
      package: 'com.keon21.frontend',
      adaptiveIcon: {
        foregroundImage: './assets/icons/header/Logo.png',
        backgroundColor: '#F2F0EF'
      }
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png'
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/login_image.png',
          imageWidth: 400,
          resizeMode: 'contain',
          backgroundColor: '#B29486'
        }
      ],
      [
        'expo-build-properties',
        {
          android: {
            useAndroidX: true,
            enableJetifier: true
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        "projectId": "8a4e1f1c-4b39-4b1b-8a62-ad91849b85bb"
      },
      API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://j12a601.p.ssafy.io/api'
    }
  }
};

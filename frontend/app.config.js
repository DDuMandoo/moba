import 'dotenv/config';

export default {
  expo: {
    name: '모여바라',
    slug: 'moba',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icons/header/Logo.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    owner: 'choseunggeun',
    ios: {
      supportsTablet: true
    },
    android: {
      package: 'com.choseunggeun.moba',
      googleServicesFile: './android/app/google-services.json',
      permissions: ['NOTIFICATIONS'],
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
        projectId: 'deb2bc3e-3308-4873-aeb6-fc7218e8033a'
      },
      API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://j12a601.p.ssafy.io/api'
    }
  }
};

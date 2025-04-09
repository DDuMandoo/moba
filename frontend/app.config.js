import 'dotenv/config';

export default {
  expo: {
    name: '모여바라',
    slug: 'frontend',
    version: '1.0.0',
    orientation: 'portrait',
<<<<<<< HEAD
    icon: './assets/icons/header/Logo.png',
    scheme: 'moyo',
=======
    icon: './assets/Icon.png',
    scheme: 'moyo',
    deeplink: true,
>>>>>>> a6d4237f2683152b8b1107fa1fdd78fc38d36c30
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    owner: 'keon211',
    ios: {
      supportsTablet: true
    },
    android: {
      package: 'com.keon211.frontend',
<<<<<<< HEAD
      googleServicesFile: './android/app/google-services.json',
=======
>>>>>>> a6d4237f2683152b8b1107fa1fdd78fc38d36c30
      adaptiveIcon: {
        foregroundImage: './assets/Icon.png',
        backgroundColor: '#F2F0EF'
      }
    },
    androidIntentFilters: [
      {
        action: 'VIEW',
        data: {
          scheme: 'moyo',
          host: '*'
        },
        category: ['BROWSABLE', 'DEFAULT']
      }
    ],
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
<<<<<<< HEAD
        "projectId": "2bad2fad-f4ca-48e9-b77b-539b2125bbc1"
=======
        projectId: "2bad2fad-f4ca-48e9-b77b-539b2125bbc1"
>>>>>>> a6d4237f2683152b8b1107fa1fdd78fc38d36c30
      },
      API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://j12a601.p.ssafy.io/api'
    }
  }
};

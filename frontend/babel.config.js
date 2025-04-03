module.exports = function (api) {
  api.cache(true);
  process.env.EXPO_ROUTER_APP_ROOT = "../../app";
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        safe: true,
        allowUndefined: false,
      }],
      'react-native-reanimated/plugin' // ✅ 맨 아래 줄에 꼭 넣기!
    ],
  };
};

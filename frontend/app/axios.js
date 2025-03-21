import axios from 'axios';
import Config from 'react-native-config';

// Axios 인스턴스 설정
const axiosInstance = axios.create({
  baseURL: Config.API_URL,  // .env 파일에서 설정한 API_URL을 사용
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;

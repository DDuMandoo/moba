/**
 * 사용법 예시:
 * import Colors from '@/constants/Colors';
 * 
 * const bgColor = Colors.background;
 *
 * 컴포넌트 스타일에 적용 예시:
 * <View style={{ backgroundColor: Colors.background }} />
 * <Text style={{ color: Colors.text }} />
 */

const Colors = {
  background: '#F2F0EF',        // 배경
  text: '#000000',              // 기본 텍스트 (검은색)
  primary: '#431905',           // 선 색, 전화 갈색
  secondary: '#A47764',         // 모카무스
  logo: '#B29486',              // 로고
  logoInner: '#E9D9C5',         // 로고 내부, 노랑 모달
  grayLightText: '#CCCCCC',     // 회색 연한 글씨
  grayDarkText: '#666666',      // 회색 진한 글씨
  grayBackground: '#F4F4F5',    // 회색 배경
  white: '#FFFFFF',             // 흰색
  black: '#000000',             // 검은색
  modalBackground: '#000000',   // 모달 배경
  yellowAccent: '#E9D9C5',      // 강조 노랑 (로고 내부와 동일)
};

export default Colors;

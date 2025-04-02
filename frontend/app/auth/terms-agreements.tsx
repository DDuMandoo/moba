import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import TermsModal from '@/components/modal/TermsModal';
import LoadingModal from '@/components/modal/LoadingModal';
import axiosInstance from '@/app/axiosInstance';
import { saveTokens } from '@/app/axiosInstance';
import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';

const BASE_URL = Constants.expoConfig?.extra?.API_URL;

const showAlert = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const PRIVACY_CONTENT = `
[ 개인정보 수집 및 이용약관 ]

1. 수집하는 개인정보 항목 및 수집 방법

  회사는 회원가입, 본인확인, 서비스 제공 등을 위해 아래와 같은 개인정보를 수집합니다.

  구분	수집 항목	수집 방법
  필수	이메일, 비밀번호, 성명	회원가입 입력
  필수	이메일 인증 코드	이메일 발송 및 입력
  필수	휴대폰 번호, SMS 인증 코드	SMS 발송 및 입력
  선택	프로필 이미지 (사진)	사용자 선택 등록 (이미지 업로드)

2. 개인정보 수집 및 이용 목적

  회사는 수집한 개인정보를 다음의 목적을 위해 이용합니다.

  회원 식별 및 가입 의사 확인

  이메일/SMS 기반 본인 인증 및 중복 가입 방지

  서비스 이용에 따른 본인 식별 및 부정 이용 방지

  분쟁 조정을 위한 기록 보존

  공지사항 전달, 서비스 관련 고지사항 전달

3. 개인정보 보유 및 이용기간

  회원 탈퇴 시까지 보관됩니다.

  단, 관련 법령에 의해 보존이 필요한 경우 해당 법령에서 정한 기간 동안 보관됩니다.

  전자상거래법 등 관련 법령에 따라 일정 기간 보관 필요 시 예외적으로 보관 가능

  이메일 인증 기록 및 SMS 인증 기록: 1년

  로그인 기록 (접속기록): 3개월 (통신비밀보호법)

4. 동의를 거부할 권리 및 거부에 따른 불이익

  이용자는 개인정보 수집 및 이용에 대한 동의를 거부할 수 있습니다.

  단, 필수 항목에 대한 수집 및 이용에 대한 동의를 거부할 경우 회원가입 및 서비스 이용이 제한될 수 있습니다.
`;

const LOCATION_CONTENT = `
[ 위치 기반 서비스 이용약관 ]

1. 위치정보의 수집 및 이용 목적

  "모여바라"는 다음과 같은 목적으로 사용자의 위치 정보를 수집 및 이용합니다.

  지역 기반 모임 추천, 내 주변 모임 탐색 기능 제공

  위치 기반 서비스 고도화 및 사용자 맞춤 정보 제공

  부정 행위 탐지 및 서비스 품질 향상

2. 수집되는 위치정보 항목 및 기술

  GPS, Wi-Fi, 기지국 정보 등을 기반으로 사용자의 실시간 위치 또는 추정 위치를 수집합니다.

  Android 및 iOS 단말기의 위치 정보 사용 허용 동의 이후 수집이 시작됩니다.

3. 위치정보 보유 및 이용기간

  실시간 위치정보는 수집 목적 달성 후 즉시 파기됩니다.

  로그 데이터(예: 추천 기록, 위치 기반 접속 기록 등)는 6개월간 보관 후 자동 삭제됩니다.

4. 제3자 제공

  회사는 원칙적으로 사용자 위치정보를 외부에 제공하지 않습니다. 단, 다음의 경우 예외적으로 제공될 수 있습니다:

  법령에 따른 요청이 있는 경우

  사용자 동의를 받은 경우

  통계 작성, 학술 연구, 시장 조사 등의 목적의 경우 (개인 식별 불가능한 형태로 처리)

5. 동의 철회 및 설정 변경

  사용자는 단말기 설정을 통해 위치정보 제공을 언제든지 중단할 수 있습니다.

  위치정보 동의 철회 시 위치 기반 기능 일부가 제한될 수 있습니다.
`;

export default function TermsAgreementScreen() {
  const router = useRouter();
  const { email, password, name, image } = useLocalSearchParams();

  const [privacyModal, setPrivacyModal] = useState(false);
  const [locationModal, setLocationModal] = useState(false);

  const [allAgreed, setAllAgreed] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeLocation, setAgreeLocation] = useState(false);

  const [loading, setLoading] = useState(false);


  const toggleAll = () => {
    const newValue = !allAgreed;
    setAllAgreed(newValue);
    setAgreePrivacy(newValue);
    setAgreeLocation(newValue);
  };

  const canProceed = agreePrivacy && agreeLocation;

  const handleSignup = async () => {
    try {
      if (!email || !password || !name) {
        return showAlert('입력 누락', '회원정보가 유효하지 않습니다.');
      }
  
      setLoading(true);
  
      // 1단계: 회원가입
      const signupRes = await axiosInstance.post(`${BASE_URL}/auth/signup`, {
        email,
        password,
        name,
      });
  
      const memberId = signupRes?.data?.result?.memberId;
      if (!memberId) throw new Error('memberId 없음');
  
      // 2단계: 프로필 이미지 업로드
      if (image) {
        const formData = new FormData();
        formData.append('image', {
          uri: image,
          name: 'profile.jpg',
          type: 'image/jpeg',
        } as any);
  
        await axiosInstance.post(`${BASE_URL}/auth/${memberId}/profile-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
  
      // 3단계: 로그인
      const loginRes = await axiosInstance.post(`${BASE_URL}/auth/signin`, {
        email,
        password,
      });
  
      const { accessToken, refreshToken } = loginRes.data.result;
      await saveTokens(accessToken, refreshToken);
  
      showAlert('회원가입 완료', '환영합니다!');
      router.replace('/(bottom-navigation)');
    } catch (err: any) {
      console.error('❌ 회원가입 실패', err);
      showAlert('회원가입 실패', err?.response?.data?.message || '잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>

      <TouchableOpacity style={[styles.agreeRow, { marginBottom: 5 }]} onPress={toggleAll}>
        <Ionicons
          name={allAgreed ? 'checkmark-circle' : 'ellipse-outline'}
          size={26}
          color={allAgreed ? Colors.primary : Colors.logo}
        />
        <Text style={styles.agreeText}>전체동의</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* 개인정보 수집 약관 */}
      <View style={styles.section}>
        <View style={styles.agreeRowWrapper}>
          <TouchableOpacity style={styles.agreeRow} onPress={() => setAgreePrivacy(!agreePrivacy)}>
            <Ionicons
              name={agreePrivacy ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={agreePrivacy ? Colors.primary : Colors.logo}
            />
            <Text style={styles.agreeText}>(필수) 개인정보 수집 및 이용약관</Text>
            <TouchableOpacity onPress={() => setPrivacyModal(true)}>
              <Ionicons name="chevron-forward" size={18} color={Colors.logo} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.agreeBox} nestedScrollEnabled>
          <Text style={styles.agreeDetail}>{PRIVACY_CONTENT}</Text>
        </ScrollView>
      </View>

      {/* 위치기반 약관 */}
      <View style={styles.section}>
        <View style={styles.agreeRowWrapper}>
          <TouchableOpacity style={styles.agreeRow} onPress={() => setAgreeLocation(!agreeLocation)}>
            <Ionicons
              name={agreeLocation ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={agreeLocation ? Colors.primary : Colors.logo}
            />
            <Text style={styles.agreeText}>(필수) 위치 기반 서비스 이용약관</Text>
            <TouchableOpacity onPress={() => setLocationModal(true)}>
              <Ionicons name="chevron-forward" size={18} color={Colors.logo} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.agreeBox} nestedScrollEnabled>
          <Text style={styles.agreeDetail}>{LOCATION_CONTENT}</Text>
        </ScrollView>
      </View>

      <Button.Large
        title="회원 가입"
        onPress={handleSignup}
        disabled={!canProceed}
        style={{
          marginTop: 20,
          backgroundColor: canProceed ? Colors.primary : Colors.grayLightText
        }}
        textColor={canProceed ? Colors.white : '#999'}
      />

      <LoadingModal visible={loading} />

      {/* 모달 */}
      <TermsModal
        visible={privacyModal}
        onClose={() => setPrivacyModal(false)}
        title="개인정보 수집 및 이용약관"
        content={PRIVACY_CONTENT}
      />
      <TermsModal
        visible={locationModal}
        onClose={() => setLocationModal(false)}
        title="위치 기반 서비스 이용약관"
        content={LOCATION_CONTENT}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: '5%',
    backgroundColor: Colors.background
  },
  section: {
    marginBottom: 10,
    marginTop: 16
  },
  agreeRowWrapper: {
    marginBottom: 10
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2
  },
  agreeText: {
    flex: 1,
    fontSize: 20,
    color: Colors.black
  },
  agreeBox: {
    height: 200,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderColor: Colors.grayLightText,
    borderWidth: 1,
    padding: 12,
    marginBottom:20
  },
  agreeDetail: {
    fontSize: 16,
    lineHeight: 20,
    color: Colors.black
  },
  divider: {
    height: 1,
    backgroundColor: Colors.grayLightText,
    marginVertical: 10
  }
});
// screens/TermsAgreementScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import TermsModal from '@/components/TermsModal';

const PRIVACY_CONTENT = `
[개인정보 수집 및 이용 안내]

1. 수집 항목: 이름, 이메일, 비밀번호, 휴대폰 번호 등
2. 수집 목적: 회원 관리, 본인확인, 민원 처리 등
3. 보유 기간: 회원 탈퇴 후 5일까지 또는 법령 기준
`;

const LOCATION_CONTENT = `
[위치기반 서비스 이용약관]

1. 수집 항목: 위치 정보
2. 이용 목적: 맞춤 서비스 제공 및 분석
3. 보유 기간: 6개월
`;

export default function TermsAgreementScreen({ navigation }: any) {
  const [privacyModal, setPrivacyModal] = useState(false);
  const [locationModal, setLocationModal] = useState(false);

  const [allAgreed, setAllAgreed] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeLocation, setAgreeLocation] = useState(false);

  const toggleAll = () => {
    const newValue = !allAgreed;
    setAllAgreed(newValue);
    setAgreePrivacy(newValue);
    setAgreeLocation(newValue);
  };

  const canProceed = agreePrivacy && agreeLocation;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>약관 동의</Text>

      {/* 전체 동의 */}
      <TouchableOpacity style={styles.agreeRow} onPress={toggleAll}>
        <Ionicons
          name={allAgreed ? 'checkmark-circle' : 'ellipse-outline'}
          size={26}
          color={allAgreed ? Colors.primary : '#ccc'}
        />
        <Text style={styles.agreeText}>전체동의</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* (필수) 개인정보 수집 */}
      <TouchableOpacity style={styles.agreeRow} onPress={() => setAgreePrivacy(!agreePrivacy)}>
        <Ionicons
          name={agreePrivacy ? 'checkmark-circle' : 'ellipse-outline'}
          size={22}
          color={agreePrivacy ? Colors.primary : '#ccc'}
        />
        <Text style={styles.agreeText}>(필수) 개인정보 수집 및 이용약관</Text>
        <TouchableOpacity onPress={() => setPrivacyModal(true)}>
          <Ionicons name="chevron-forward" size={18} color="#555" />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* 약관 내용 1 */}
      <ScrollView style={styles.agreeBox} nestedScrollEnabled>
        <Text style={styles.agreeDetail}>{PRIVACY_CONTENT}</Text>
      </ScrollView>

      {/* (필수) 위치기반 서비스 */}
      <TouchableOpacity style={styles.agreeRow} onPress={() => setAgreeLocation(!agreeLocation)}>
        <Ionicons
          name={agreeLocation ? 'checkmark-circle' : 'ellipse-outline'}
          size={22}
          color={agreeLocation ? Colors.primary : '#ccc'}
        />
        <Text style={styles.agreeText}>(필수) 위치 기반 서비스 이용약관</Text>
        <TouchableOpacity onPress={() => setLocationModal(true)}>
          <Ionicons name="chevron-forward" size={18} color="#555" />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* 약관 내용 2 */}
      <ScrollView style={styles.agreeBox} nestedScrollEnabled>
        <Text style={styles.agreeDetail}>{LOCATION_CONTENT}</Text>
      </ScrollView>

      {/* 다음 버튼 */}
      <Button.Large
        title="회원 가입"
        onPress={() => navigation.navigate('signup')}
        disabled={!canProceed}
        style={{ marginTop: 30 }}
      />

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
    paddingHorizontal: 24,
    paddingTop: 32,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  agreeText: {
    flex: 1,
    fontSize: 16,
    color: '#333'
  },
  agreeBox: {
    height: 100,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16
  },
  agreeDetail: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555'
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16
  }
});

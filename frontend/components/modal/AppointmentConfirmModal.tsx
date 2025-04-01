import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import Colors from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

interface Participant {
  id: number;
  name: string;
  image: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: {
    name: string;
    time: string;
    location: string;
    participants: Participant[];
  };
}

export default function AppointmentConfirmModal({
  visible,
  onClose,
  onConfirm,
  data
}: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* 닫기 버튼 */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={26} color={Colors.black} />
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.contentWrapper}>
            <Text style={styles.title}>약속 생성 확인</Text>
            <Text style={styles.subtitle}>다음 내용으로 약속을 생성하시겠습니까?</Text>

            {/* 약속명 */}
            <View style={styles.section}>
              <View style={styles.rowLabel}>
                <Ionicons name="pricetag-outline" size={18} color={Colors.secondary} style={styles.icon} />
                <Text style={styles.sectionTitle}>약속명</Text>
              </View>
              <Text style={styles.value}>{data.name}</Text>
            </View>

            {/* 참가자 */}
            <View style={styles.section}>
              <View style={styles.rowLabel}>
                <Ionicons name="people-outline" size={18} color={Colors.secondary} style={styles.icon} />
                <Text style={styles.sectionTitle}>참가자</Text>
              </View>
              {data.participants.length === 0 ? (
                <Text style={styles.empty}>선택한 참가자가 없습니다.</Text>
              ) : (
                <View style={styles.participantsWrap}>
                  {data.participants.map((p) => (
                    <View key={p.id} style={styles.profileItem}>
                      <Image source={{ uri: p.image }} style={styles.profileImage} />
                      <Text style={styles.profileName}>{p.name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* 날짜 및 시간 */}
            <View style={styles.section}>
              <View style={styles.rowLabel}>
                <Ionicons name="calendar-outline" size={18} color={Colors.secondary} style={styles.icon} />
                <Text style={styles.sectionTitle}>날짜 및 시간</Text>
              </View>
              <Text style={styles.value}>{data.time}</Text>
            </View>

            {/* 장소 */}
            <View style={styles.section}>
              <View style={styles.rowLabel}>
                <Ionicons name="location-outline" size={18} color={Colors.secondary} style={styles.icon} />
                <Text style={styles.sectionTitle}>장소</Text>
              </View>
              <Text style={styles.value}>{data.location || <Text style={styles.empty}>선택한 장소가 없습니다.</Text>}</Text>
            </View>
          </ScrollView>

          <View style={styles.buttonWrap}>
            <Button.Medium title="약속 생성" onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBox: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 24,
    position: 'relative'
  },
  closeButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 10
  },
  contentWrapper: {
    paddingBottom: 5
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: Colors.grayLightText,
    marginBottom: 24
  },
  section: {
    marginBottom: 24
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  icon: {
    marginRight: 10
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black
  },
  value: {
    fontSize: 18,
    color: Colors.black,
    lineHeight: 24,
    marginTop: 2
  },
  empty: {
    fontSize: 16,
    color: Colors.grayLightText,
    fontStyle: 'italic'
  },
  participantsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    rowGap: 16
  },
  profileItem: {
    alignItems: 'center',
    width: 60
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.logo
  },
  profileName: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.black,
    textAlign: 'center'
  },
  buttonWrap: {
    marginTop: 10
  }
});

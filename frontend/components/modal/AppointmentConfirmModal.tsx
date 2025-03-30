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

export default function AppointmentConfirmModal({ visible, onClose, onConfirm, data }: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <ScrollView contentContainerStyle={styles.contentWrapper}>
            <Text style={styles.title}>약속 생성 확인</Text>
            <Text style={styles.subtitle}>다음 내용으로 약속을 생성하시겠습니까?</Text>

            {/* 약속명 */}
            <View style={styles.section}>
              <View style={styles.rowLabel}>
                <Text style={styles.sectionTitle}>약속명</Text>
              </View>
              <Text style={styles.value}>{data.name}</Text>
            </View>

            {/* 참가자 */}
            <View style={styles.section}>
              <View style={styles.rowLabel}>
                <Text style={styles.sectionTitle}>참가자</Text>
              </View>
              <View style={styles.participantsWrap}>
                {data.participants.map((p) => (
                  <View key={p.id} style={styles.profileItem}>
                    <Image source={{ uri: p.image }} style={styles.profileImage} />
                    <Text style={styles.profileName}>{p.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 날짜 및 시간 */}
            <View style={styles.section}>
              <View style={styles.rowLabel}>
                <Text style={styles.sectionTitle}>날짜 및 시간</Text>
              </View>
              <Text style={styles.value}>{data.time}</Text>
            </View>

            {/* 장소 */}
            <View style={styles.section}>
              <View style={styles.rowLabel}>
                <Text style={styles.sectionTitle}>장소</Text>
              </View>
              <Text style={styles.value}>{data.location}</Text>
            </View>
          </ScrollView>

          <View style={styles.buttonWrap}>
            <Button.Large title="약속 생성" onPress={onConfirm} />
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
    borderRadius: 20,
    padding: 24
  },
  contentWrapper: {
    paddingBottom: 30
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black
  },
  value: {
    fontSize: 18,
    color: Colors.black
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
    color: Colors.black
  },
  buttonWrap: {
    marginTop: 10
  }
});

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import axiosInstance from '@/app/axiosInstance';
import Colors from '@/constants/Colors';
import DelegateProfile from '../profile/DelegateProfile';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

export interface Participant {
  memberId: number;
  name: string;
  profileImage: string | null;
  state: string;
}

interface DelegateModalProps {
  visible: boolean;
  onClose: () => void;
  appointmentId: number;
  currentHostId: number;
  participants: Participant[];
  onSuccess?: (newHost: Participant) => void;
}

const DelegateModal = ({
  visible,
  onClose,
  appointmentId,
  currentHostId,
  participants,
  onSuccess,
}: DelegateModalProps) => {
  const [selectedMember, setSelectedMember] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const eligibleMembers = participants.filter(
    (p) => p.memberId !== currentHostId
  );

  const handleConfirm = async () => {
    if (!selectedMember) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await axiosInstance.patch(
        `/appointments/${appointmentId}/delegate`,
        { newHostId: selectedMember.memberId }
      );
      if (onSuccess) onSuccess(selectedMember);
      onClose();
    } catch (err: any) {
        console.error('권한 위임 실패:', err.response?.data);
        setErrorMsg(
          err.response?.data?.message || '권한 위임에 실패하였습니다. 다시 시도해주세요.'
        );
      } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>방장 권한 위임</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.black} />
            </Pressable>
          </View>
          <Text style={styles.subtitle}>
            약속의 정보를 수정하거나 장소를 추천받을 수 있어요!{'\n'}
            권한을 위임할 참가자를 선택해주세요.
          </Text>

          <View style={styles.memberList}>
            {eligibleMembers.length > 0 ? (
              eligibleMembers.map((item) => {
                const isSelected = selectedMember?.memberId === item.memberId;
                return (
                  <Pressable
                    key={item.memberId}
                    onPress={() => setSelectedMember(item)}
                    style={ styles.memberItem }
                  >
                    <View style={styles.radio}>
                    {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <DelegateProfile name={item.name} image={item.profileImage ?? ''} size={40} />
                  </Pressable>
                );
              })
            ) : (
              <Text style={styles.emptyText}>위임할 멤버가 없습니다.</Text>
            )}
          </View>

          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

          <View style={styles.buttonRow}>
          <View style={styles.buttonRow}>
            <Button.Small
                title="취소"
                onPress={onClose}
                textColor={Colors.primary}
                style={{
                backgroundColor: Colors.white,
                borderColor: Colors.primary,
                borderWidth: 1.5,
                }}
            />
            <Button.Small
                title="확인"
                onPress={handleConfirm}
                disabled={!selectedMember || loading}
                textColor={Colors.white}
                style={{
                backgroundColor: Colors.primary,
                borderColor: Colors.primary,
                borderWidth: 1.5,
                opacity: !selectedMember || loading ? 0.5 : 1,
                }}
            />
            </View>
          </View>

          {loading && <ActivityIndicator style={{ marginTop: 8 }} />}
        </View>
      </View>
    </Modal>
  );
};

export default DelegateModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: '5%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.grayLightText,
    marginBottom: 20,
    lineHeight: 20,
  },
  memberList: {
    marginBottom: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.logo,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.logo,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.grayLightText,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    textAlign: 'center',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
});

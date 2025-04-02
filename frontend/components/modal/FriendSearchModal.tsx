import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import {
  useSearchFriends,
  Member,
  Appointment,
  SearchMode
} from '@/hooks/useSearchFriends';
import SelectedProfileItem from '../profile/SelectedProfileItem';
import ProfileWithEmail from '../profile/ProfileWithEmail';
import AppointmentSummaryItem from '../profile/AppointmentSummaryItem';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (selected: Member[]) => void;
  initialSelected?: Member[];
}

const FriendSearchModal = ({ visible, onClose, onSelect, initialSelected = [] }: Props) => {
  const [searchText, setSearchText] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownOption, setDropdownOption] = useState<'약속명' | '참가자'>('약속명');
  const [tab, setTab] = useState<'참가자' | '약속'>('참가자');
  const [selected, setSelected] = useState<Member[]>(initialSelected);

  const mode: SearchMode = dropdownOption === '약속명'
    ? '약속명'
    : tab === '참가자'
    ? '참가자'
    : '참가자의 약속';

  const { data, fetchMore, loading, hasMore } = useSearchFriends(debouncedKeyword, mode);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(searchText.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  const toggleSelect = (item: Member) => {
    const exists = selected.find((s) => s.memberId === item.memberId);
    setSelected(exists ? selected.filter((s) => s.memberId !== item.memberId) : [...selected, item]);
  };

  const toggleAppointmentMembers = (appointment: Appointment) => {
    const toAdd = (appointment.members || []).filter(
      (m) => !selected.some((s) => s.memberId === m.memberId)
    );
    setSelected([...selected, ...toAdd]);
  };

  const renderItem = ({ item }: { item: Member | Appointment }) => {
    if ((mode === '약속명' || mode === '참가자의 약속') && 'appointmentId' in item) {
      const appointment = item as Appointment;
      return (
        <TouchableOpacity style={styles.profileWithEmailRow} onPress={() => toggleAppointmentMembers(appointment)}>
          <AppointmentSummaryItem
            name={appointment.name}
            imageUri={appointment.imageUrl}
            participantProfileImages={
              (appointment.members || []).map((m) => m.profileImage || '')
            }
            size={45}
          />
          <Ionicons name="add" size={20} color={Colors.secondary} />
        </TouchableOpacity>
      );
    }

    const member = item as Member;
    const isSelected = selected.some((s) => s.memberId === member.memberId);

    return (
      <TouchableOpacity style={styles.profileWithEmailRow} onPress={() => toggleSelect(member)}>
        <ProfileWithEmail
          name={member.name}
          email={member.email || ''}
          imageUri={member.profileImage || ''}
          size={45}
        />
        <Ionicons
          name={isSelected ? 'remove' : 'add'}
          size={20}
          color={Colors.secondary}
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>
    );
  };

  const renderTabs = () => {
    if (dropdownOption !== '참가자') return null;
    return (
      <View style={styles.tabContainer}>
        {(['참가자', '약속'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.tab, tab === type && styles.activeTab]}
            onPress={() => setTab(type)}
          >
            <Text style={[styles.tabText, tab === type && styles.activeTabText]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          setDropdownOpen(false);
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.header}>
              <Text style={styles.title}>참가자 추가</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={Colors.black} />
              </TouchableOpacity>
            </View>
            <Text style={styles.subTitle}>약속에 초대할 참가자를 검색하세요.</Text>

            {selected.length > 0 && (
              <View style={styles.selectedContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.selectedScrollWrap}
                >
                  {selected.map((p) => (
                    <View key={p.memberId} style={styles.selectedItem}>
                      <SelectedProfileItem
                        name={p.name}
                        image={p.profileImage}
                        size={52}
                        onRemove={() => toggleSelect(p)}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.searchRow}>
              <View>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setDropdownOpen((prev) => !prev)}
                >
                  <Text style={styles.dropdownText}>{dropdownOption}</Text>
                  <Ionicons name="chevron-down" size={16} color={Colors.primary} />
                </TouchableOpacity>
                {dropdownOpen && (
                  <View style={styles.dropdownMenu}>
                    {(['약속명', '참가자'] as const).map((item) => (
                      <TouchableOpacity
                        key={item}
                        onPress={() => {
                          setDropdownOption(item);
                          setDropdownOpen(false);
                        }}
                        style={styles.dropdownItem}
                      >
                        <Text style={[styles.dropdownText, dropdownOption === item && styles.dropdownSelectedText]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <View style={styles.searchInputContainer}>
                <TextInput
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="검색어를 입력해주세요.."
                  placeholderTextColor={Colors.grayLightText}
                  style={styles.searchInput}
                />
                <TouchableOpacity onPress={() => setDebouncedKeyword(searchText.trim())}>
                  <Ionicons name="search" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {renderTabs()}

            <FlatList
              data={data}
              keyExtractor={(item) =>
                'memberId' in item ? `m-${item.memberId}` : `a-${item.appointmentId}`
              }
              renderItem={renderItem}
              onEndReached={() => {
                if (hasMore && !loading) fetchMore();
              }}
              ListEmptyComponent={!loading ? () => (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
                </View>
              ) : null}
              contentContainerStyle={{ paddingVertical: 4 }}
            />

            <TouchableOpacity style={styles.confirmBtn} onPress={() => { onSelect(selected); onClose(); }}>
              <Text style={styles.confirmText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default FriendSearchModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBox: {
    width: '90%',
    height: '85%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black
  },
  subTitle: {
    fontSize: 13,
    color: Colors.grayDarkText,
    marginTop: 6,
    marginBottom: 10
  },
  selectedContainer: {
    marginBottom: 12,
    maxHeight: 100,
  },
  selectedScrollWrap: {
    paddingHorizontal: 2,
    alignItems: 'center'
  },
  selectedItem: {
    marginTop: 10,
    marginRight: 8
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    height: 35,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 10
  },
  dropdownText: {
    color: Colors.primary,
    fontSize: 14,
    textAlign: 'left',
    marginLeft: 5
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    width: 82,
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    zIndex: 10
  },
  dropdownItem: {
    padding: 9
  },
  dropdownSelectedText: {
    fontWeight: 'bold',
    color: Colors.primary
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10
  },
  searchInput: {
    flex: 1,
    color: Colors.black,
    fontSize: 14
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 12
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: Colors.grayBackground
  },
  activeTab: {
    backgroundColor: Colors.logoInner
  },
  tabText: {
    color: Colors.grayDarkText,
    fontSize: 14
  },
  activeTabText: {
    fontWeight: 'bold',
    color: Colors.primary
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16
  },
  confirmText: {
    color: Colors.white,
    fontSize: 16
  },
  emptyBox: {
    paddingVertical: 20,
    alignItems: 'center'
  },
  emptyText: {
    color: Colors.grayLightText,
    fontSize: 14
  },
  profileWithEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8
  },
});

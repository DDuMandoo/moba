import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from '@/app/axiosInstance';
import { Alert } from 'react-native';

interface Participant {
  memberId: number;
  name: string;
  profileImage: string | null;
  state: 'JOINED' | 'WAIT';
}

interface MenuItem {
  id: string;
  name: string;
  price: string;
  participants: string[];
}

export interface MenuSplitSectionRef {
  handleConfirmRound: (isImmediate?: boolean) => void;
}

interface Props {
  participants?: Participant[];
  dutchpayId?: number;
  round: number;
  onConfirmRound: (
    data: {
      totalPrice: number;
      items: {
        name: string;
        price: number;
        participants: number[];
      }[];
    },
    isImmediate?: boolean // ✅ 이 부분도 필요
  ) => void;
  onAddRound?: () => void; // ✅ 추가!
}

const MenuSplitSection = forwardRef<MenuSplitSectionRef, Props>(
  ({ participants, dutchpayId, round, onConfirmRound }, ref) => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [newMenuName, setNewMenuName] = useState('');
    const [newMenuPrice, setNewMenuPrice] = useState('');
    const [totalAmount, setTotalAmount] = useState('0');
    const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
    const [participantList, setParticipantList] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (!participants) return;
      const joined = participants.filter((p) => p.state === 'JOINED');
      setParticipantList(joined);
    }, [participants]);

    useEffect(() => {
      setMenuItems([]);
      setNewMenuName('');
      setNewMenuPrice('');
      setSelectedMenuId(null);
      setTotalAmount('0');
    }, [round]);

    useImperativeHandle(ref, () => ({
      handleConfirmRound: (isImmediate = false) => {
        if (menuItems.length === 0) return;
    
        const totalPrice = menuItems.reduce(
          (sum, item) => sum + (parseInt(item.price.replace(/,/g, '')) || 0),
          0
        );
    
        const items = menuItems.map((item) => ({
          name: item.name,
          price: parseInt(item.price.replace(/,/g, '')) || 0,
          participants: item.participants.map(Number),
        }));
    
        onConfirmRound({ totalPrice, items }, isImmediate);
    
        // ✅ isImmediate일 경우 상태 초기화
        if (isImmediate) {
          setMenuItems([]);
          setNewMenuName('');
          setNewMenuPrice('');
          setSelectedMenuId(null);
          setTotalAmount('0');
        }
      },
    }));

    const formatCurrency = (value: string) => {
      const numeric = value.replace(/[^0-9]/g, '');
      return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const handleAddMenu = () => {
      if (!newMenuName.trim() || !newMenuPrice.trim()) return;

      const newMenuItem: MenuItem = {
        id: Date.now().toString(),
        name: newMenuName,
        price: formatCurrency(newMenuPrice),
        participants: [],
      };

      setMenuItems([...menuItems, newMenuItem]);
      setNewMenuName('');
      setNewMenuPrice('');
    };

    const handleRemoveMenu = (id: string) => {
      setMenuItems(menuItems.filter((item) => item.id !== id));
      if (selectedMenuId === id) setSelectedMenuId(null);
    };

    const openParticipantSelection = (menuId: string) => {
      setSelectedMenuId((prev) => (prev === menuId ? null : menuId));
    };

    const toggleParticipantSelection = (participantId: string) => {
      if (!selectedMenuId) return;

      setMenuItems((prev) =>
        prev.map((item) => {
          if (item.id === selectedMenuId) {
            const isSelected = item.participants.includes(participantId);
            const updated = isSelected
              ? item.participants.filter((id) => id !== participantId)
              : [...item.participants, participantId];

            return { ...item, participants: updated };
          }
          return item;
        })
      );

      const toggleParticipantSelection = (participantId: string) => {
        if (!selectedMenuId) return;
      
        setMenuItems((prev) =>
          prev.map((item) => {
            if (item.id === selectedMenuId) {
              const isSelected = item.participants.includes(participantId);
              const updated = isSelected
                ? item.participants.filter((id) => id !== participantId)
                : [...item.participants, participantId];
      
              return { ...item, participants: updated };
            }
            return item;
          })
        );
      
        // ❌ 드롭다운 닫지 말고 유지!
        // setSelectedMenuId(null);
      };
      
    };

    const handleReceiptCapture = async () => {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
    
      if (result.canceled || !result.assets || !result.assets[0].uri) return;
    
      if (!dutchpayId) {
        console.error('❗ dutchpayId가 전달되지 않았습니다.');
        return;
      }
    
      const imageUri = result.assets[0].uri;
      const fileName = imageUri.split('/').pop();
      const fileType = imageUri.split('.').pop();
    
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        name: fileName,
        type: `image/${fileType}`,
      } as any);
    
      try {
        setLoading(true);
        const { data } = await axios.post(`/dutchpays/ocr`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
    
        const results = data?.result;
    
        if (!Array.isArray(results) || results.length === 0) {
          Alert.alert('영수증 인식 실패', '영수증을 다시 촬영해주세요.');
          return;
        }
    
        const newItems = results.map((item: any) => ({
          id: Date.now().toString() + Math.random(),
          name: item.item, // ← 여기!! OCR 상품명
          price: formatCurrency(item.price.toString()), // ← 단가 포맷팅
          participants: [],
        }));
    
        setMenuItems((prev) => [...prev, ...newItems]);
      } catch (err: any) {
        console.error('❌ OCR 업로드 실패:', err);
    
        const message =
          err?.response?.data?.message || err?.message || '잠시 후 다시 시도해주세요.';
        Alert.alert('영수증 인식 실패', message);
      } finally {
        setLoading(false);
      }
    };
    
    

    useEffect(() => {
      const total = menuItems.reduce((sum, item) => {
        return sum + (parseInt(item.price.replace(/,/g, '')) || 0);
      }, 0);
      setTotalAmount(formatCurrency(total.toString()));
    }, [menuItems]);

    const handleConfirmRound = () => {
      if (menuItems.length === 0) return;

      const totalPrice = menuItems.reduce(
        (sum, item) => sum + (parseInt(item.price.replace(/,/g, '')) || 0),
        0
      );

      const items = menuItems.map((item) => ({
        name: item.name,
        price: parseInt(item.price.replace(/,/g, '')) || 0,
        participants: item.participants.map(Number),
      }));

      onConfirmRound({ totalPrice, items });
    };

    const getParticipantById = (id: string) =>
      participantList.find((p) => String(p.memberId) === id);

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {loading && (
        <Modal transparent animationType="fade">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <Image
              source={require('@/assets/animations/loading.gif')}
              style={{ width: 500, height: 500 }}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}
        <View style={styles.header}>
          <Text style={styles.totalText}>총 금액: {totalAmount}원</Text>
          <TouchableOpacity style={styles.photoButton} onPress={handleReceiptCapture}>
            <MaterialIcons name="camera-alt" size={20} color={Colors.text} />
            <Text style={styles.photoButtonText}>영수증 촬영</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuInputRow}>
          <TextInput
            style={styles.menuNameInput}
            value={newMenuName}
            onChangeText={setNewMenuName}
            placeholder="메뉴 이름"
            placeholderTextColor={Colors.grayLightText}
          />
          <TextInput
            style={styles.menuPriceInput}
            value={newMenuPrice}
            onChangeText={(text) => setNewMenuPrice(formatCurrency(text))}
            placeholder="가격"
            keyboardType="numeric"
            placeholderTextColor={Colors.grayLightText}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddMenu}>
            <Text style={styles.addButtonText}>추가</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={menuItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: 120 }]}
          renderItem={({ item }) => {
            const isDropdownOpen = selectedMenuId === item.id;

            return (
              <View style={{ marginBottom: isDropdownOpen ? 40 : 0 }}>
                <View style={styles.menuRow}>
                  <Text style={styles.menuName}>{item.name}</Text>
                  <Text style={styles.menuPrice}>{item.price}원</Text>

                  <View style={styles.menuActions}>
                    <View style={{ position: 'relative' }}>
                      <TouchableOpacity
                        style={styles.selectDropdown}
                        onPress={() => openParticipantSelection(item.id)}
                      >
                        <View style={styles.dropdownSummary}>
                        {item.participants.length > 0 ? (
                        <View style={styles.selectedUserContainer}>
                          {(() => {
                            const participantIds = item.participants;
                            const firstUser = getParticipantById(participantIds[0]);
                            const secondUser = getParticipantById(participantIds[1]);

                            if (!firstUser) return null;

                            if (participantIds.length === 1) {
                              return (
                                <View style={styles.selectedUserItem}>
                                  <Image
                                    source={
                                      firstUser.profileImage
                                        ? { uri: firstUser.profileImage }
                                        : require('@/assets/images/defaultprofile.png')
                                    }
                                    style={styles.profileImageSmall}
                                  />
                                  <Text numberOfLines={1} style={styles.selectedUserName}>
                                    {firstUser.name}
                                  </Text>
                                </View>
                              );
                            }

                            return (
                              <>
                                <Image
                                  source={
                                    firstUser?.profileImage
                                      ? { uri: firstUser.profileImage }
                                      : require('@/assets/images/defaultprofile.png')
                                  }
                                  style={styles.profileImageSmall}
                                />
                                {secondUser && (
                                  <Image
                                    source={
                                      secondUser.profileImage
                                        ? { uri: secondUser.profileImage }
                                        : require('@/assets/images/defaultprofile.png')
                                    }
                                    style={styles.profileImageSmall}
                                  />
                                )}
                                {participantIds.length > 2 && (
                                  <Text style={styles.selectedUserName}>+{participantIds.length - 2}</Text>
                                )}
                              </>
                            );
                          })()}
                        </View>
                      ) : (
                        <Text style={styles.selectedUserName}>선택</Text>
                      )}

                                <View style={{ flex: 1 }} />
                          <MaterialIcons name="arrow-drop-down" size={20} color={Colors.text} />
                        </View>
                      </TouchableOpacity>

                      {isDropdownOpen && (
                        <View style={styles.inlineDropdown}>
                          {participantList.length === 0 ? (
                            <Text style={{ fontSize: 13, color: 'gray' }}>
                              선택 가능한 참가자가 없습니다.
                            </Text>
                          ) : (
                            participantList.map((p) => {
                              const isSelected = item.participants.includes(String(p.memberId));
                              return (
                                <TouchableOpacity
                                  key={p.memberId}
                                  style={[
                                    styles.participantItem,
                                    isSelected && styles.participantItemSelected,
                                  ]}
                                  onPress={() => toggleParticipantSelection(String(p.memberId))}
                                >
                                  <View style={styles.participantInfo}>
                                    <Image
                                      source={
                                        p.profileImage
                                          ? { uri: p.profileImage }
                                          : require('@/assets/images/defaultprofile.png')
                                      }
                                      style={styles.profileImage}
                                    />
                                    <Text style={styles.participantName}>{p.name}</Text>
                                  </View>
                                  {isSelected && (
                                    <MaterialIcons name="check" size={20} color={Colors.primary} />
                                  )}
                                </TouchableOpacity>
                              );
                            })
                          )}
                        </View>
                      )}
                    </View>

                    <TouchableOpacity onPress={() => handleRemoveMenu(item.id)}>
                      <MaterialIcons name="delete" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>메뉴를 추가해 주세요</Text>
            </View>
          }
        />
      </KeyboardAvoidingView>
    );
  }
);

export default MenuSplitSection;

const styles = StyleSheet.create({
  confirmButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 20,
    marginTop: 16,
  },
  totalText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.grayLightText,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  photoButtonText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  menuInputRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  menuNameInput: {
    flex: 1.2,
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: Fonts.regular,
  },
  menuPriceInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: Fonts.regular,
  },
  addButton: {
    flex: 0.5,
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  menuRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  menuName: {
    flex: 1.5,
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  menuPrice: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  menuActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  selectDropdown: {
    width: 110,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.grayLightText,
    backgroundColor: 'transparent',
  },
  dropdownSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectedUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    overflow: 'hidden',
    gap: 6,
  },
  selectedUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 90,
  },
  selectedUserName: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.text,
    marginLeft: 2,
    maxWidth: 50,
  },
  profileImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.grayLightText,
  },
  profileImageSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.grayLightText,
  },
  inlineDropdown: {
    position: 'absolute',
    top: 40,
    left: 0,
    width: 110,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.grayLightText,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    zIndex: 10,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  participantItemSelected: {
    backgroundColor: '#F5F5F5',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  participantName: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.grayDarkText,
    fontFamily: Fonts.regular,
  },
});
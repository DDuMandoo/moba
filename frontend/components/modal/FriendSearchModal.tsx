import React from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet
} from 'react-native';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface Friend {
  id: number;
  name: string;
  image: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (selected: Friend[]) => void;
}

const dummyFriends: Friend[] = [
  { id: 1, name: '조승근', image: 'https://placekitten.com/100/100' },
  { id: 2, name: '김지호', image: 'https://placekitten.com/101/100' },
  { id: 3, name: '박경완', image: 'https://placekitten.com/102/100' },
  // ... 더미 데이터 추가 가능
];

export default function FriendSearchModal({ visible, onClose, onSelect }: Props) {
  const [selected, setSelected] = React.useState<Friend[]>([]);

  const toggleSelect = (friend: Friend) => {
    if (selected.find(f => f.id === friend.id)) {
      setSelected(selected.filter(f => f.id !== friend.id));
    } else {
      setSelected([...selected, friend]);
    }
  };

  const handleConfirm = () => {
    onSelect(selected);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>참가자 추가</Text>
          <FlatList
            data={dummyFriends}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.item} onPress={() => toggleSelect(item)}>
                <View style={styles.left}>
                  <Image source={{ uri: item.image }} style={styles.avatar} />
                  <Text style={styles.name}>{item.name}</Text>
                </View>
                <Ionicons
                  name={selected.find(f => f.id === item.id) ? 'checkmark' : 'add'}
                  size={20}
                  color={Colors.logo}
                />
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn}>
            <Text style={styles.confirmText}>확인</Text>
          </TouchableOpacity>
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 16
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.grayLightText
  },
  name: {
    fontSize: 16,
    color: Colors.black
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
    alignItems: 'center'
  },
  confirmText: {
    color: Colors.white,
    fontSize: 16
  }
});

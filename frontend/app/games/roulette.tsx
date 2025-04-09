// SvgRoulette.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  Modal,
  Dimensions,
  Alert,
  FlatList,
  Image,
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
} from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/Colors';

const SIZE = Dimensions.get('window').width * 0.9;
const CENTER = SIZE / 2;
const SLICE_COLORS = [
  '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9',
  '#BAE1FF', '#E2BAFF', '#FFD6FF', '#C2F0FC',
];

export default function SvgRoulette() {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const anglePerItem = 360 / (items.length || 1);

  const spin = (velocity = 1) => {
    if (spinning || items.length < 2) return;

    const rand = Math.floor(Math.random() * items.length);
    const baseDeg = 360 * 5;
    const finalDeg = baseDeg + (360 - rand * anglePerItem - anglePerItem / 2 - 90);

    setSpinning(true);
    setResult(null);

    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: finalDeg - 20,
        duration: Math.min(Math.max(velocity * 7000, 2000), 9000),
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: finalDeg,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setResult(items[rand]);
      setSpinning(false);
      rotateAnim.setValue(finalDeg % 360);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderRelease: (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (spinning || items.length < 2) return;
        const velocity = Math.sqrt(gestureState.vx ** 2 + gestureState.vy ** 2);
        if (velocity > 0.1) spin(velocity);
      },
    })
  ).current;

  const interpolated = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const renderSlices = () => {
    if (items.length === 0) return null;
    return items.map((label, i) => {
      const startAngle = i * anglePerItem;
      const endAngle = startAngle + anglePerItem;
      const largeArc = anglePerItem > 180 ? 1 : 0;

      const x1 = CENTER + CENTER * Math.cos((Math.PI * startAngle) / 180);
      const y1 = CENTER + CENTER * Math.sin((Math.PI * startAngle) / 180);
      const x2 = CENTER + CENTER * Math.cos((Math.PI * endAngle) / 180);
      const y2 = CENTER + CENTER * Math.sin((Math.PI * endAngle) / 180);

      const d = `M${CENTER},${CENTER} L${x1},${y1} A${CENTER},${CENTER} 0 ${largeArc} 1 ${x2},${y2} Z`;

      const textAngle = startAngle + anglePerItem / 2;
      const textRadius = CENTER * 0.7;
      const textX = CENTER + textRadius * Math.cos((Math.PI * textAngle) / 180);
      const textY = CENTER + textRadius * Math.sin((Math.PI * textAngle) / 180);

      return (
        <G key={i}>
          <Path d={d} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />
          <SvgText
            fill={Colors.black}
            fontSize={16}
            fontWeight="bold"
            x={textX}
            y={textY}
            transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
            textAnchor="middle"
          >
            {label}
          </SvgText>
        </G>
      );
    });
  };

  const addItem = () => {
    if (input.length > 6) {
      Alert.alert('제한', '6글자 이하만 입력할 수 있어요.');
      return;
    }

    const trimmed = input.trim();
    if (!trimmed) return;
    if (items.length >= 8) {
      Alert.alert('제한', '최대 8개까지만 입력할 수 있어요.');
      return;
    }
    setItems([...items, trimmed]);
    setInput('');
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.arrow} />

      <View style={styles.wheelWrapper}>
        <Animated.View style={[{ transform: [{ rotate: interpolated }] }]}> 
          <Svg width={SIZE} height={SIZE}>{renderSlices()}</Svg>
        </Animated.View>
        <Pressable style={styles.spinButton} onPress={() => spin()}>
          <Image
            source={require('@/assets/images/wonderCapybara.png')}
            style={{ width: 48, height: 48 }}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="무엇이든 입력해 보세요"
          style={styles.input}
          onSubmitEditing={addItem}
        />
        <Pressable onPress={addItem} style={styles.addButton}>
          <Text style={styles.addText}>추가</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item, index) => item + index}
        contentContainerStyle={styles.itemList}
        renderItem={({ item, index }) => (
          <View style={styles.itemTag}>
            <Text style={styles.itemText}>{item}</Text>
            <Pressable onPress={() => removeItem(index)}>
              <Text style={styles.itemRemove}>×</Text>
            </Pressable>
          </View>
        )}
        numColumns={4}
        columnWrapperStyle={{ justifyContent: 'flex-start' }}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={!!result} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>🎉 결과 🎉</Text>
            <Text style={styles.modalResult}>{result}</Text>
            <Pressable style={styles.modalClose} onPress={() => setResult(null)}>
              <Text style={styles.modalCloseText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingTop: 60,
  },
  wheelWrapper: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    position: 'absolute',
    top: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 24,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.primary,
    zIndex: 10,
  },
  spinButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  inputRow: {
    flexDirection: 'row',
    marginTop: 24,
    paddingHorizontal: 20,
    width: '100%',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  itemList: {
    paddingHorizontal: 20,
    marginTop: 16,
    rowGap: 12,
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  itemTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  itemText: {
    color: Colors.primary,
    marginRight: 8,
  },
  itemRemove: {
    color: Colors.logo,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: 260,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalResult: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  modalClose: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 16,
  },
  modalCloseText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});

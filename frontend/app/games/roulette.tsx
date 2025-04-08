import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import Colors from '@/constants/Colors';

const ROULETTE_SIZE = 300;
const SLICE_COLORS = [
  '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6BD6',
  '#6A67CE', '#FF9F1C', '#00C9A7', '#FF5F5D', '#00B8D9',
];

export default function CustomRouletteGame() {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const lastAngle = useRef(0);
  const currentAngle = useRef(0);

  const [options, setOptions] = useState<string[]>(['치킨', '피자']);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    const id = spinAnim.addListener(({ value }) => {
      currentAngle.current = value;
    });
    return () => spinAnim.removeListener(id);
  }, []);

  const addOption = () => {
    if (!input.trim()) return;
    if (options.length >= 10) {
      Alert.alert('제한', '최대 10개까지 입력할 수 있어요.');
      return;
    }
    setOptions((prev) => [...prev, input.trim()]);
    setInput('');
  };

  const spinWheel = () => {
    if (isSpinning || options.length < 2) {
      Alert.alert('입력 필요', '최소 2개 이상의 항목을 입력해주세요.');
      return;
    }

    setIsSpinning(true);
    setResult(null);

    const rounds = 5;
    const selected = Math.floor(Math.random() * options.length);
    const anglePerItem = 360 / options.length;
    const finalAngle = 360 * rounds + selected * anglePerItem + anglePerItem / 2;

    Animated.timing(spinAnim, {
      toValue: lastAngle.current + finalAngle,
      duration: 3000,
      useNativeDriver: true,
      easing: Easing.out(Easing.exp),
    }).start(() => {
      lastAngle.current += finalAngle;
      const adjusted = lastAngle.current % 360;
      const index = Math.floor(adjusted / anglePerItem) % options.length;
      setResult(options[index]);
      setIsSpinning(false);
    });
  };

  const interpolatedRotate = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isSpinning,
      onMoveShouldSetPanResponder: () => !isSpinning,
      onPanResponderMove: (_, gestureState) => {
        const angleDelta = gestureState.dx * 0.5;
        spinAnim.setValue(lastAngle.current + angleDelta);
      },
      onPanResponderRelease: (_, gestureState) => {
        const velocity = gestureState.vx;
        Animated.decay(spinAnim, {
          velocity: velocity * 5,
          deceleration: 0.995,
          useNativeDriver: true,
        }).start(() => {
          lastAngle.current = currentAngle.current % 360;
        });
      },
    })
  ).current;

  const renderSlices = () => {
    const anglePerItem = 360 / options.length;
    return options.map((label, index) => {
      const backgroundColor = SLICE_COLORS[index % SLICE_COLORS.length];
      const rotateDeg = anglePerItem * index;
      return (
        <View
          key={index}
          style={[
            styles.slice,
            {
              backgroundColor,
              transform: [
                { rotate: `${rotateDeg}deg` },
                { translateY: -ROULETTE_SIZE / 4 },
              ],
            },
          ]}
        >
          <Text style={styles.sliceText}>{label}</Text>
        </View>
      );
    });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: 'padding' })}>
      <Text style={styles.title}>🎯 커스텀 룰렛</Text>

      <View style={styles.rouletteWrapper}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.roulette, { transform: [{ rotate: interpolatedRotate }] }]}
        >
          {renderSlices()}
        </Animated.View>
        <View style={styles.pointer} />
      </View>

      <View style={styles.inputBox}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="항목 입력 (예: 짜장면)"
          style={styles.input}
          onSubmitEditing={addOption}
          returnKeyType="done"
        />
        <Button.Small title="추가" onPress={addOption} />
      </View>

      <FlatList
        data={options}
        keyExtractor={(item, idx) => `${item}-${idx}`}
        horizontal
        style={styles.optionList}
        contentContainerStyle={styles.optionListContent}
        renderItem={({ item }) => <Text style={styles.optionItem}>{item}</Text>}
        showsHorizontalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <Button.Large title="돌리기" onPress={spinWheel} disabled={isSpinning} />
        {result && <Text style={styles.resultText}>🎉 결과: {result}</Text>}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  rouletteWrapper: {
    width: ROULETTE_SIZE,
    height: ROULETTE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  roulette: {
    width: ROULETTE_SIZE,
    height: ROULETTE_SIZE,
    borderRadius: ROULETTE_SIZE / 2,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  slice: {
    position: 'absolute',
    width: '50%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  sliceText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  pointer: {
    position: 'absolute',
    top: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'red',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  optionList: {
    marginTop: 16,
    maxHeight: 32,
  },
  optionListContent: {
    gap: 12,
    paddingHorizontal: 4,
  },
  optionItem: {
    backgroundColor: Colors.grayLightText,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 14,
    color: Colors.text,
  },
  footer: {
    marginTop: 36,
    alignItems: 'center',
    gap: 16,
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
});

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Colors from '@/constants/Colors';
import dayjs from 'dayjs';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialValue?: Date;
}

export default function CustomDateTimePicker({ visible, onClose, onConfirm, initialValue }: Props) {
  const today = dayjs().format('YYYY-MM-DD');
  const [step, setStep] = useState<'date' | 'time'>('date');
  const [selectedDate, setSelectedDate] = useState(dayjs(initialValue || today).format('YYYY-MM-DD'));
  const [hour, setHour] = useState(dayjs(initialValue || new Date()).hour());
  const [minute, setMinute] = useState(dayjs(initialValue || new Date()).minute());

  const handleDateSelect = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    setStep('time');
  };

  const handleConfirm = () => {
    const fullDate = dayjs(`${selectedDate} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`).toDate();
    onConfirm(fullDate);
    onClose();
    setStep('date');
  };

  const handleCancel = () => {
    onClose();
    setStep('date');
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {step === 'date' ? (
            <Calendar
              current={selectedDate}
              onDayPress={handleDateSelect}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: Colors.yellowAccent }
              }}
              theme={{
                backgroundColor: Colors.white,
                calendarBackground: Colors.white,
                textSectionTitleColor: Colors.grayLightText,
                selectedDayBackgroundColor: Colors.yellowAccent,
                selectedDayTextColor: Colors.white,
                todayTextColor: Colors.logo,
                dayTextColor: Colors.black,
                textDisabledColor: '#d9e1e8',
                monthTextColor: Colors.black,
                arrowColor: Colors.logo,
                textDayFontFamily: 'NanumSquareRound',
                textMonthFontFamily: 'NanumSquareRound-Bold',
                textDayHeaderFontFamily: 'NanumSquareRound-Bold',
              }}
            />
          ) : (
            <View style={styles.timeBox}>
              <Text style={styles.timeTitle}>🕒 시간 선택</Text>
              <View style={styles.timeRow}>
                <FlatList
                  horizontal
                  data={Array.from({ length: 24 }, (_, i) => i)}
                  keyExtractor={(item) => `h-${item}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.timeItem, hour === item && styles.timeItemSelected]}
                      onPress={() => setHour(item)}
                    >
                      <Text style={[styles.timeText, hour === item && styles.timeTextSelected]}>{item}시</Text>
                    </TouchableOpacity>
                  )}
                  showsHorizontalScrollIndicator={false}
                />
                <FlatList
                  horizontal
                  data={Array.from({ length: 60 }, (_, i) => i)}
                  keyExtractor={(item) => `m-${item}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.timeItem, minute === item && styles.timeItemSelected]}
                      onPress={() => setMinute(item)}
                    >
                      <Text style={[styles.timeText, minute === item && styles.timeTextSelected]}>{item}분</Text>
                    </TouchableOpacity>
                  )}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.cancel}>취소</Text>
            </TouchableOpacity>
            {step === 'time' && (
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={styles.confirm}>확인</Text>
              </TouchableOpacity>
            )}
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
    backgroundColor: Colors.white,
    width: '90%',
    borderRadius: 16,
    padding: 24
  },
  timeBox: {
    alignItems: 'center'
  },
  timeTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: Colors.logo
  },
  timeRow: {
    width: '100%',
    gap: 16
  },
  timeItem: {
    backgroundColor: '#f4f4f4',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8
  },
  timeItemSelected: {
    backgroundColor: Colors.logo
  },
  timeText: {
    fontSize: 16,
    color: Colors.black
  },
  timeTextSelected: {
    color: Colors.white,
    fontWeight: 'bold'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24
  },
  cancel: {
    fontSize: 16,
    color: Colors.grayDarkText,
    marginRight: 16
  },
  confirm: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.logo
  }
});

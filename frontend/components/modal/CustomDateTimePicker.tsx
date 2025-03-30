import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import Colors from '@/constants/Colors';
import dayjs from 'dayjs';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialValue?: Date;
}

export default function CustomDateTimeModal({ visible, onClose, onConfirm, initialValue }: Props) {
  const today = dayjs().format('YYYY-MM-DD');
  const [step, setStep] = useState<'date' | 'hour' | 'minute'>('date');
  const [selectedDate, setSelectedDate] = useState(dayjs(initialValue || today).format('YYYY-MM-DD'));
  const [hour, setHour] = useState(dayjs(initialValue || new Date()).hour());
  const [minute, setMinute] = useState(dayjs(initialValue || new Date()).minute());

  const handleConfirm = () => {
    const fullDate = dayjs(`${selectedDate} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`).toDate();
    onConfirm(fullDate);
    setStep('date');
    onClose();
  };

  const handleCancel = () => {
    setStep('date');
    onClose();
  };

  const renderClockFace = (mode: 'hour' | 'minute') => {
    const count = mode === 'hour' ? 12 : 60;
    const items = Array.from({ length: count }, (_, i) => i * (mode === 'hour' ? 1 : 5));
    return (
      <View style={styles.clockContainer}>
        {items.map((val, index) => {
          const angle = (index / items.length) * 2 * Math.PI;
          const x = Math.sin(angle) * 90;
          const y = -Math.cos(angle) * 90;
          const selected = (mode === 'hour' ? hour : minute) === val;
          return (
            <TouchableOpacity
              key={val}
              style={[styles.clockNumber, {
                left: 100 + x,
                top: 100 + y,
                backgroundColor: selected ? Colors.logo : 'transparent'
              }]}
              onPress={() => {
                mode === 'hour' ? setHour(val) : setMinute(val);
                if (mode === 'hour') setStep('minute');
              }}
            >
              <Text style={[styles.clockText, selected && { color: Colors.white, fontWeight: 'bold' }]}> {val} </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {step === 'date' && (
            <Calendar
              current={selectedDate}
              onDayPress={(day: DateData) => {
                setSelectedDate(day.dateString);
                setStep('hour');
              }}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: Colors.logo }
              }}
              theme={{
                backgroundColor: Colors.white,
                calendarBackground: Colors.white,
                textSectionTitleColor: Colors.grayLightText,
                selectedDayBackgroundColor: Colors.logo,
                selectedDayTextColor: Colors.white,
                todayTextColor: Colors.primary,
                dayTextColor: Colors.black,
                textDisabledColor: '#d9e1e8',
                monthTextColor: Colors.black,
                arrowColor: Colors.logo,
                textDayFontFamily: 'NanumSquareRound',
                textMonthFontFamily: 'NanumSquareRound-Bold',
                textDayHeaderFontFamily: 'NanumSquareRound-Bold',
              }}
            />
          )}

          {step === 'hour' && (
            <>
              <Text style={styles.title}>🕒 시간 선택</Text>
              {renderClockFace('hour')}
            </>
          )}

          {step === 'minute' && (
            <>
              <Text style={styles.title}>⏱ 분 선택</Text>
              {renderClockFace('minute')}
            </>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.cancel}>취소</Text>
            </TouchableOpacity>
            {step === 'minute' && (
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
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBox: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.logo,
    marginBottom: 12
  },
  clockContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center'
  },
  clockNumber: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  clockText: {
    fontSize: 14,
    color: Colors.black
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    width: '100%'
  },
  cancel: {
    fontSize: 16,
    color: Colors.grayDarkText,
    marginRight: 20
  },
  confirm: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.logo
  }
});

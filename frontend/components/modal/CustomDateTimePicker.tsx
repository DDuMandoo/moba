import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import Colors from '@/constants/Colors';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

const leftArrow = require('@/assets/icons/arrow/leftArrow.png');
const rightArrow = require('@/assets/icons/arrow/rightArrow.png');
const doubleLeftArrow = require('@/assets/icons/arrow/doubleLeftArrow.png');
const doubleRightArrow = require('@/assets/icons/arrow/doubleRightArrow.png');

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialValue?: Date;
}

export default function CustomDateTimePicker({ visible, onClose, onConfirm, initialValue }: Props) {
  const [step, setStep] = useState<'date' | 'hour' | 'minute'>('date');
  const [selectedDate, setSelectedDate] = useState(dayjs(initialValue || new Date()));
  const [currentMonth, setCurrentMonth] = useState(dayjs(initialValue || new Date()));
  const [rawHour, setRawHour] = useState(selectedDate.hour() % 12 || 12);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(selectedDate.hour() >= 12 ? 'PM' : 'AM');
  const [minute, setMinute] = useState(Math.floor(selectedDate.minute() / 5) * 5);

  const getFinalHour = () => {
    let hour = rawHour % 12;
    return ampm === 'PM' ? hour + 12 : hour;
  };

  const handleConfirm = () => {
    const fullDate = selectedDate
      .hour(getFinalHour())
      .minute(minute)
      .second(0)
      .toDate();
    onConfirm(fullDate);
    onClose();
    setStep('date');
  };

  const handleCancel = () => {
    onClose();
    setStep('date');
  };

  const renderClockFace = (mode: 'hour' | 'minute') => {
    const items =
      mode === 'hour'
        ? Array.from({ length: 12 }, (_, i) => i + 1)
        : Array.from({ length: 12 }, (_, i) => i * 5);

    const selected = mode === 'hour' ? rawHour : minute;

    return (
      <View style={styles.clockContainer}>
        {items.map((val, index) => {
          const angle = (index / items.length) * 2 * Math.PI;
          const x = Math.sin(angle) * 90;
          const y = -Math.cos(angle) * 90;

          return (
            <TouchableOpacity
              key={val}
              style={[styles.clockNumber, {
                left: 100 + x,
                top: 100 + y,
                backgroundColor: selected === val ? Colors.logo : 'transparent'
              }]}
              onPress={() => {
                if (mode === 'hour') {
                  setRawHour(val);
                  setStep('minute');
                } else {
                  setMinute(val);
                }
              }}
            >
              <Text style={[styles.clockText, selected === val && { color: Colors.white, fontWeight: 'bold' }]}>
                {val}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => setCurrentMonth(prev => prev.subtract(1, 'year'))}>
        <Image source={doubleLeftArrow} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setCurrentMonth(prev => prev.subtract(1, 'month'))}>
        <Image source={leftArrow} style={styles.icon} />
      </TouchableOpacity>
      <Text style={styles.monthText}>{currentMonth.format('YYYY년 M월')}</Text>
      <TouchableOpacity onPress={() => setCurrentMonth(prev => prev.add(1, 'month'))}>
        <Image source={rightArrow} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setCurrentMonth(prev => prev.add(1, 'year'))}>
        <Image source={doubleRightArrow} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {step === 'date' && (
            <>
              {renderHeader()}
              <View style={styles.weekRow}>
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                  <Text key={day} style={styles.weekText}>{day}</Text>
                ))}
              </View>
              <Calendar
                key={currentMonth.format('YYYY-MM')}
                current={currentMonth.format('YYYY-MM-DD')}
                onDayPress={(day: DateData) => {
                  setSelectedDate(dayjs(day.dateString));
                  setStep('hour');
                }}
                markedDates={{
                  [selectedDate.format('YYYY-MM-DD')]: {
                    selected: true,
                    selectedColor: Colors.logo
                  }
                }}
                hideDayNames
                disableMonthChange={true}
                renderArrow={() => null}
                disableArrowLeft={true}
                disableArrowRight={true}
                renderHeader={() => <></>}
                firstDay={0}
                theme={{
                  backgroundColor: Colors.white,
                  calendarBackground: Colors.white,
                  textDayFontFamily: 'NanumSquareRound',
                  textMonthFontFamily: 'NanumSquareRound-Bold',
                  textDayHeaderFontFamily: 'NanumSquareRound-Bold'
                }}
              />
            </>
          )}

          {step === 'hour' && (
            <>
              <Text style={styles.title}>🕒 시간 선택</Text>
              <View style={styles.clockWrapper}>{renderClockFace('hour')}</View>
              <View style={styles.ampmRow}>
                <TouchableOpacity
                  style={[styles.ampmButton, ampm === 'AM' && styles.ampmSelected]}
                  onPress={() => setAmpm('AM')}
                >
                  <Text style={[styles.ampmText, ampm === 'AM' && styles.ampmTextSelected]}>오전</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ampmButton, ampm === 'PM' && styles.ampmSelected]}
                  onPress={() => setAmpm('PM')}
                >
                  <Text style={[styles.ampmText, ampm === 'PM' && styles.ampmTextSelected]}>오후</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 'minute' && (
            <>
              <Text style={styles.title}>⏱ 분 선택</Text>
              <View style={styles.clockWrapper}>{renderClockFace('minute')}</View>
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
    width: '90%'
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.logo,
    marginBottom: 12,
    alignSelf: 'center'
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12
  },
  icon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    marginHorizontal: 2,
    padding: 4,
  },
  
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4
  },
  weekText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.grayDarkText
  },
  clockWrapper: {
    alignItems: 'center',
    justifyContent: 'center'
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
  ampmRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12
  },
  ampmButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.grayLightText
  },
  ampmSelected: {
    backgroundColor: Colors.logo,
    borderColor: Colors.logo
  },
  ampmText: {
    fontSize: 14,
    color: Colors.grayDarkText
  },
  ampmTextSelected: {
    color: Colors.white,
    fontWeight: 'bold'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20
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
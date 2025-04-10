import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import Colors from '@/constants/Colors';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import axiosInstance from '@/app/axiosInstance';
import { useRouter } from 'expo-router';
import PromiseCard from '@/components/promises/PromiseCard';
import { useFocusEffect } from 'expo-router';

dayjs.locale('ko');

const doubleLeftArrow = require('@/assets/icons/arrow/doubleLeftArrow.png');
const leftArrow = require('@/assets/icons/arrow/leftArrow.png');
const rightArrow = require('@/assets/icons/arrow/rightArrow.png');
const doubleRightArrow = require('@/assets/icons/arrow/doubleRightArrow.png');

type Dot = {
  key?: string;
  color: string;
};

export default function AppointmentCalendarSection() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [markedDots, setMarkedDots] = useState<Record<string, Dot[]>>({});
  const router = useRouter();

  const fetchAppointments = async (year: number, month: number) => {
    try {
      const res = await axiosInstance.get(`/appointments`, {
        params: { year, month },
      });
      const result = res.data.result || [];

      const grouped: Record<string, any[]> = {};
      result.forEach((item: any) => {
        const date = dayjs(item.time).format('YYYY-MM-DD');
        if (!grouped[date]) grouped[date] = [];
        if (grouped[date].length < 2) grouped[date].push(item);
      });

      const dots: Record<string, Dot[]> = {};
      Object.entries(grouped).forEach(([date, list]) => {
        dots[date] = list.map((_, idx) => ({
          key: `${date}-${idx}`,
          color: idx === 0 ? Colors.logo : Colors.logoInner,
        }));
      });

      setMarkedDots(dots);
      setAppointments(result);
    } catch (err: any) {
      console.error('❌ 약속 로딩 실패:', err?.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchAppointments(currentMonth.year(), currentMonth.month() + 1);
  }, [currentMonth]);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments(currentMonth.year(), currentMonth.month() + 1);
    }, [currentMonth])
  );
  

  const selectedDateStr = selectedDate.format('YYYY-MM-DD');
  const todayStr = dayjs().format('YYYY-MM-DD');

  const dailyAppointments = appointments
    .filter((item) => dayjs(item.time).format('YYYY-MM-DD') === selectedDateStr)
    .sort((a, b) => dayjs(a.time).valueOf() - dayjs(b.time).valueOf());

  return (
    <>
      <View style={styles.containerBox}>
        <Text style={styles.sectionTitle}>내 약속</Text>

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

        <Calendar
          key={currentMonth.format('YYYY-MM')}
          current={currentMonth.format('YYYY-MM-DD')}
          onDayPress={(day: DateData) => setSelectedDate(dayjs(day.dateString))}
          disableMonthChange
          renderArrow={() => null}
          disableArrowLeft
          disableArrowRight
          renderHeader={() => <></>}
          firstDay={0}
          markingType="multi-dot"
          dayComponent={({ date, state }: { date: DateData; state: 'selected' | 'disabled' | '' }) => {
            const dateStr = date.dateString;
            const isSelected = selectedDateStr === dateStr;
            const isToday = todayStr === dateStr;
            const isThisMonth = dayjs(dateStr).month() === currentMonth.month();
            const dots = markedDots[dateStr] || [];

            return (
              <View style={{ alignItems: 'center', paddingVertical: 0, height: 38, justifyContent: 'center' }}>
                <TouchableOpacity onPress={() => setSelectedDate(dayjs(dateStr))}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: isSelected ? Colors.logo : 'transparent',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: isSelected
                          ? Colors.white
                          : !isThisMonth
                          ? Colors.grayLightText
                          : isToday
                          ? Colors.logo
                          : Colors.black,
                      }}
                    >
                      {date.day}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', marginTop: 4, height: 7 }}>
                  {dots.map((dot) => (
                    <View
                      key={dot.key}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 4,
                        backgroundColor: dot.color,
                        marginHorizontal: 1,
                      }}
                    />
                  ))}
                </View>
              </View>
            );
          }}
          theme={{
            backgroundColor: Colors.white,
            calendarBackground: Colors.white,
            textDayFontFamily: 'NanumSquareRound',
            textMonthFontFamily: 'NanumSquareRound-Bold',
            textDayHeaderFontFamily: 'NanumSquareRound-Bold',
          }}
        />
      </View>

      <Text style={styles.dateTitle}>{selectedDate.format('YYYY년 M월 D일')}의 약속</Text>

      <View style={styles.cardSection}>
        {dailyAppointments.length > 0 ? (
          dailyAppointments.map((promise) => (
            <PromiseCard
              key={promise.appointmentId}
              appointmentId={promise.appointmentId}
              imageUrl={promise.imageUrl}
              title={promise.name}
              time={promise.time}
              location={promise.placeName}
              onPress={() =>
                router.push({
                  pathname: promise.isEnded ? '/promises/[id]/ended' : '/promises/[id]',
                  params: { id: String(promise.appointmentId) },
                })
              }
            />
          ))
        ) : (
          <Text style={styles.noAppointmentText}>약속이 없어요</Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  containerBox: {
    marginTop: 28,
    padding: '5%',
    backgroundColor: Colors.white,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 14,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingTop: 8
  },
  icon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    marginHorizontal: 2,
    padding: 9,
  },
  monthText: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.secondary,
    marginBottom: 5,
  },
  dateTitle: {
    marginTop: 18,
    marginHorizontal: 5,
    fontSize: 20,
    fontWeight: '500',
    color: Colors.black,
  },
  cardSection: {
    marginTop: 16,
  },
  noAppointmentText: {
    fontSize: 16,
    color: Colors.grayDarkText,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from '@/app/axiosInstance';
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';
import EqualSplitSection from '@/components/settlement/EqualSplitSection';
import MenuSplitSection, { MenuSplitSectionRef } from '@/components/settlement/MenuSplitSection';
import { Button } from '@/components/ui/Button';
import TransferConfirmModal from '@/components/settlement/TransferConfirmModal';

interface Participant {
  memberId: number;
  name: string;
  profileImage: string | null;
  state: 'JOINED' | 'WAIT';
}

interface RoundData {
  round: number;
  totalPrice: number;
  splitAmounts: {
    memberId: number;
    price: number;
  }[];
}

export default function SettlementPage() {
  const { id: appointmentId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [amount, setAmount] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [splitAmounts, setSplitAmounts] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<'equal' | 'menu'>('equal');
  const [remaining, setRemaining] = useState(0);
  const [round, setRound] = useState(1);
  const [roundDataList, setRoundDataList] = useState<RoundData[]>([]);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [tempRoundData, setTempRoundData] = useState<RoundData | null>(null);
  const menuRef = useRef<MenuSplitSectionRef>(null);

  const fetchParticipants = async () => {
    try {
      const { data } = await axios.get(`/appointments/${appointmentId}`);
      const joined = data.result.participants.filter((p: Participant) => p.state === 'JOINED');
      setParticipants(joined);
    } catch (e) {
      Alert.alert('불러오기 실패', '참여자 정보를 가져오지 못했습니다.');
    }
  };

  useEffect(() => {
    if (appointmentId) fetchParticipants();
  }, [appointmentId]);

  const formatCurrency = (value: string) => {
    const numeric = value.replace(/[^0-9]/g, '');
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const unformatCurrency = (value: string) => value.replace(/[^0-9]/g, '');

  const handleConfirm = () => {
    const total = parseInt(unformatCurrency(amount), 10);
    if (!total || participants.length === 0) {
      Alert.alert('입력 오류', '정산 금액과 인원을 확인해주세요.');
      return;
    }

    const base = Math.floor(total / participants.length);
    const remainder = total % participants.length;
    const result = participants.map((_, i) =>
      i === 0 ? formatCurrency((base + remainder).toString()) : formatCurrency(base.toString())
    );
    setSplitAmounts(result);

    const used = result.reduce((acc, cur) => acc + parseInt(unformatCurrency(cur), 10), 0);
    setRemaining(total - used);
  };

  const handleFinalSubmit = () => {
    if (round > 5) {
      Alert.alert('제한 초과', '정산은 최대 5차까지만 가능합니다.');
      return;
    }

    if (selectedTab === 'menu') {
      menuRef.current?.handleConfirmRound?.();
    } else {
      const total = parseInt(unformatCurrency(amount), 10);
      if (total && participants.length > 0) {
        const newRoundData: RoundData = {
          round,
          totalPrice: total,
          splitAmounts: participants.map((p, i) => ({
            memberId: p.memberId,
            price: parseInt(unformatCurrency(splitAmounts[i] ?? '0'), 10),
          })),
        };
        setTempRoundData(newRoundData);
        setIsConfirmModalVisible(true);
      }
    }
  };

  const handleAddRound = () => {
    if (round >= 5) {
      Alert.alert('제한 초과', '정산은 최대 5차까지만 가능합니다.');
      return;
    }

    if (selectedTab === 'menu') {
      menuRef.current?.handleConfirmRound?.(true);
    } else {
      const total = parseInt(unformatCurrency(amount), 10);
      if (total && participants.length > 0) {
        const newRoundData: RoundData = {
          round,
          totalPrice: total,
          splitAmounts: participants.map((p, i) => ({
            memberId: p.memberId,
            price: parseInt(unformatCurrency(splitAmounts[i] ?? '0'), 10),
          })),
        };
        setRoundDataList((prev) => [...prev, newRoundData]);
        setRound((prev) => prev + 1);
        setAmount('');
        setSplitAmounts([]);
        setRemaining(0);
      }
    }
  };

  const handleMenuConfirmRound = (
    data: { totalPrice: number; items: { name: string; price: number; participants: number[] }[] },
    isImmediate = false
  ) => {
    const mappedRound: RoundData = {
      round,
      totalPrice: data.totalPrice,
      splitAmounts: participants.map((p) => {
        const totalForMember = data.items.reduce((acc, item) => {
          if (item.participants.includes(p.memberId)) {
            acc += Math.floor(item.price / item.participants.length);
          }
          return acc;
        }, 0);
        return {
          memberId: p.memberId,
          price: totalForMember,
        };
      }),
    };

    if (isImmediate) {
      setRoundDataList((prev) => [...prev, mappedRound]);
      setRound((prev) => prev + 1);
    } else {
      setTempRoundData(mappedRound);
      setIsConfirmModalVisible(true);
    }
  };

  const handleModalClose = () => {
    setTempRoundData(null);
    setIsConfirmModalVisible(false);
  };

  const handleChangeAmount = (text: string) => {
    setAmount(formatCurrency(text));
  };

  const handleRemove = (id: number) => {
    setParticipants((prev) => prev.filter((p) => p.memberId !== id));
    setSplitAmounts((prev) => prev.filter((_, i) => participants[i].memberId !== id));
  };

  const updateIndividualAmount = (index: number, value: string) => {
    const formatted = formatCurrency(value);
    const updated = [...splitAmounts];
    updated[index] = formatted;
    setSplitAmounts(updated);

    const total = parseInt(unformatCurrency(amount), 10);
    const used = updated.reduce((acc, cur) => acc + parseInt(unformatCurrency(cur), 10), 0);
    setRemaining(total - used);
  };

  const getRoundsForConfirmModal = () => {
    const combinedRounds = [...roundDataList, ...(tempRoundData ? [tempRoundData] : [])];

    const participantTotals: Record<number, number> = {};
    let total = 0;

    combinedRounds.forEach((r) => {
      total += r.totalPrice;
      r.splitAmounts.forEach((s) => {
        if (!participantTotals[s.memberId]) participantTotals[s.memberId] = 0;
        participantTotals[s.memberId] += s.price;
      });
    });

    const allParticipants = Object.entries(participantTotals).map(([memberId, price]) => {
      const p = participants.find((p) => p.memberId === Number(memberId));
      return {
        memberId: Number(memberId),
        name: p?.name ?? '',
        profileImage: p?.profileImage ?? null,
        price,
      };
    });

    const rounds = combinedRounds.map((r) => ({
      round: r.round,
      totalPrice: r.totalPrice,
      participants: r.splitAmounts.map((s) => {
        const p = participants.find((p) => p.memberId === s.memberId);
        return {
          memberId: s.memberId,
          name: p?.name ?? '',
          profileImage: p?.profileImage ?? null,
          price: s.price,
        };
      }),
    }));

    return {
      rounds,
      total,
      participantTotals: allParticipants,
    };
  };

  const { rounds, total, participantTotals } = getRoundsForConfirmModal();

  const submitFinalDutchpay = async () => {
    try {
      console.log('[정산 요청 시작]'); // ✅ 요청 시작 로그
  
      const payload = {
        appointmentId: Number(appointmentId),
        totalPrice: total,
        participants: participantTotals.map((p) => ({
          memberId: p.memberId,
          price: p.price,
        })),
      };
  
      console.log('[요청 보낼 데이터]', payload); // ✅ 실제 보낼 데이터 확인
  
      const response = await axios.post('/dutchpays', payload);
      console.log('[정산 생성 hostId]', response.data.result.hostId);

      
  
      console.log('[서버 응답]', response.data); // ✅ 응답 내용 확인
  
      if (response.data.isSuccess) {
        setIsConfirmModalVisible(false);
        router.replace(`/promises/${appointmentId}/completed/${response.data.result.dutchpayId}`);
      } else {
        Alert.alert('실패', response.data.message ?? '정산 요청에 실패했습니다.');
      }
    } catch (error: any) {
      console.log('[정산 요청 에러]', error); // ✅ 에러 로그 출력
  
      // axios 에러라면 응답 안에 정보가 있을 수도 있음
      if (error.response) {
        console.log('[에러 응답]', error.response.data);
        Alert.alert('에러', error.response.data.message || '요청에 실패했습니다.');
      } else {
        Alert.alert('에러', '서버와의 연결에 실패했어요.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>정산하기 ({round}차)</Text>
          <TouchableOpacity style={styles.roundButton} onPress={handleAddRound}>
            <Text style={styles.roundButtonText}>차수 추가</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'equal' && styles.tabActive]}
            onPress={() => setSelectedTab('equal')}
          >
            <Text style={selectedTab === 'equal' ? styles.tabActiveText : styles.tabInactiveText}>
              1/N하기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'menu' && styles.tabActive]}
            onPress={() => setSelectedTab('menu')}
          >
            <Text style={selectedTab === 'menu' ? styles.tabActiveText : styles.tabInactiveText}>
              메뉴별 입력
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectedTab === 'equal' ? (
        <EqualSplitSection
          participants={participants}
          splitAmounts={splitAmounts}
          totalAmount={amount}
          onAmountChange={handleChangeAmount}
          onUpdateAmount={updateIndividualAmount}
          onRemove={handleRemove}
          onConfirm={handleConfirm}
          remainingAmount={remaining}
          formatCurrency={formatCurrency}
          onOpenConfirmModal={() => setIsConfirmModalVisible(true)}
          round={round}
        />
      ) : (
        <MenuSplitSection
          ref={menuRef}
          participants={participants}
          dutchpayId={Number(appointmentId)}
          round={round}
          onConfirmRound={handleMenuConfirmRound}
          onAddRound={handleAddRound}
        />
      )}

      <View style={styles.buttonWrapper}>
        <Button.Large title="정산 요청하기" onPress={handleFinalSubmit} />
      </View>

      {isConfirmModalVisible && (
        <TransferConfirmModal
          visible={isConfirmModalVisible}
          onClose={handleModalClose}
          onConfirm={submitFinalDutchpay}
          rounds={rounds}
          totalAmount={total}
          participantTotals={participantTotals}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerWrapper: {
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
    gap: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  roundButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: 'center',
  },
  roundButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: Colors.primary,
    marginTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderColor: Colors.primary,
  },
  tabActiveText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    fontFamily: Fonts.bold,
  },
  tabInactiveText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.grayDarkText,
    fontFamily: Fonts.bold,
  },
  buttonWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: Colors.background,
  },
});

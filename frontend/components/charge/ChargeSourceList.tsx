import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Colors from '@/constants/Colors';
import { useAppSelector } from '@/redux/hooks';
import { getBankMeta } from '@/constants/banks';

interface Props {
  selectedAccountId: string | null;
  onSelectAccount: (id: string) => void;
  title?: string;
  showAddButton?: boolean;
  addButtonText?: string;
  onPressAddAccount?: () => void;
}

export default function AccountListSection({
  selectedAccountId,
  onSelectAccount,
  title = '계좌 목록',
  showAddButton = true,
  addButtonText = '계좌연결',
  onPressAddAccount,
}: Props) {
  const accounts = useAppSelector((state) => state.account.list);
  const isLoading = false; // 필요 시 로딩 처리 연결
  const isError = false;   // 필요 시 에러 처리 연결

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showAddButton && (
          <TouchableOpacity onPress={onPressAddAccount} style={styles.addButton}>
            <Text style={styles.addText}>{addButtonText}</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 16 }} />
      ) : isError ? (
        <Text style={styles.errorText}>계좌를 불러올 수 없습니다.</Text>
      ) : !Array.isArray(accounts) || accounts.length === 0 ? (
        <Text style={styles.emptyText}>연결된 계좌가 없습니다.</Text>
      ) : (
        accounts.map((acc, index) => {
          const bank = getBankMeta(acc.type);
          const accountId = acc.id ?? `${acc.type}-${acc.account}`;
          const selected = accountId === selectedAccountId;
          const key = `${accountId}-${index}`;

          return (
            <TouchableOpacity
              key={key}
              onPress={() => onSelectAccount(accountId)}
              style={[
                styles.accountRow,
                selected && { backgroundColor: Colors.grayBackground },
              ]}
            >
              <Image
                source={bank.logo}
                style={styles.bankLogo}
                resizeMode="contain"
              />
              <View>
                <Text style={styles.bankName}>{bank.name}</Text>
                <Text style={styles.bankAccount}>{acc.account}</Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  errorText: {
    color: 'red',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: Colors.grayDarkText,
    paddingVertical: 24,
    textAlign: 'center',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#E6E4E3',
  },
  bankLogo: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  bankName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  bankAccount: {
    fontSize: 13,
    color: Colors.grayDarkText,
  },
});

export const BANKS = [
    { type: 'MOBA', name: '모바은행', logo: require('@/assets/icons/banks/mybank.png') },
    { type: 'nh', name: '농협은행', logo: require('@/assets/icons/banks/nh.png') },
    { type: 'kakao', name: '카카오뱅크', logo: require('@/assets/icons/banks/kakao.png') },
    { type: 'jeonbuk', name: '하나은행', logo: require('@/assets/icons/banks/hana.png') },
    { type: 'suhyup', name: '우리은행', logo: require('@/assets/icons/banks/woori.png') },
    { type: 'kb', name: '국민은행', logo: require('@/assets/icons/banks/kb.png') },
    { type: 'shinhan', name: '신한은행', logo: require('@/assets/icons/banks/shinhan.png') },
    { type: 'kbank', name: '케이뱅크', logo: require('@/assets/icons/banks/kbank.png') },
    { type: 'toss', name: '토스뱅크', logo: require('@/assets/icons/banks/toss.png') },
  ];
  
  export const getBankMeta = (typeOrName: string) => {
    return (
      BANKS.find(
        (bank) => bank.type === typeOrName || bank.name === typeOrName
      ) || {
        type: typeOrName,
        name: typeOrName,
        logo: require('@/assets/icons/banks/default.png'),
      }
    );
  };
  
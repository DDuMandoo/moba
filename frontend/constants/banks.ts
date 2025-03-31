export const BANKS = [
    { type: 'my', name: '모바은행', logo: require('@/assets/icons/banks/mybank.png') },
    { type: 'nh', name: '농협은행', logo: require('@/assets/icons/banks/nh.png') },
    { type: 'kakao', name: '카카오뱅크', logo: require('@/assets/icons/banks/kakao.png') },
    { type: 'jeonbuk', name: '하나은행', logo: require('@/assets/icons/banks/hana.png') },
    { type: 'suhyup', name: '우리리은행', logo: require('@/assets/icons/banks/woori.png') },
    { type: 'kb', name: '국민은행', logo: require('@/assets/icons/banks/kb.png') },
    { type: 'shinhan', name: '신한은행', logo: require('@/assets/icons/banks/shinhan.png') },
    { type: 'kbank', name: '케이뱅크', logo: require('@/assets/icons/banks/kbank.png') },
    { type: 'toss', name: '토스뱅크', logo: require('@/assets/icons/banks/toss.png') },
  ];
  
  export const getBankMeta = (type: string) => {
    return (
      BANKS.find((bank) => bank.type === type) || {
        type,
        name: type,
        logo: require('@/assets/icons/banks/default.png'),
      }
    );
  };
  
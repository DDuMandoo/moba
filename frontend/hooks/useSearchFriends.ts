import { useEffect, useState } from 'react';
import axiosInstance from '@/app/axiosInstance';

export type SearchMode = '약속명' | '참가자' | '참가자의 약속';

export interface Member {
  memberId: number;
  name: string;
  email: string;
  profileImage: string | null;
}

export interface Appointment {
  appointmentId: number;
  name: string;
  time: string;
  imageUrl: string;
  isEnded: boolean;
  members: Member[];
}

interface UseSearchFriendsReturn {
  data: (Member | Appointment)[];
  fetchMore: () => void;
  loading: boolean;
  hasMore: boolean;
  reset: () => void;
}

export const useSearchFriends = (
  keyword: string,
  mode: SearchMode
): UseSearchFriendsReturn => {
  const [data, setData] = useState<(Member | Appointment)[]>([]);
  const [cursorId, setCursorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetch = async (isReset = false) => {
    if (loading || (!keyword && mode !== '약속명')) return;
    setLoading(true);

    try {
      let endpoint = '';
      let resultKey = '';
      const params: any = { size: 10 };
      if (cursorId && !isReset) params.cursorId = cursorId;
      if (keyword) params.keyword = keyword;

      if (mode === '약속명') {
        endpoint = '/appointments/search';
        resultKey = 'results';
      } else if (mode === '참가자') {
        endpoint = '/appointments/search/member';
        resultKey = 'members';
      } else {
        endpoint = '/appointments/search/appointment';
        resultKey = 'appointments';
      }

      const res = await axiosInstance.get(endpoint, { params });
      const list = res?.data?.result?.[resultKey] || [];
      const newCursor = res?.data?.result?.cursorId;

      setData((prev) => (isReset ? list : [...prev, ...list]));
      setCursorId(newCursor);
      setHasMore(list.length > 0);
    } catch (e) {
      console.error('❌ 검색 실패', e);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCursorId(null);
    setHasMore(true);
    fetch(true);
  }, [keyword, mode]);

  return {
    data,
    fetchMore: () => fetch(),
    loading,
    hasMore,
    reset: () => {
      setData([]);
      setCursorId(null);
      setHasMore(true);
    }
  };
};

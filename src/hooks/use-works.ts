import { useQuery } from '@tanstack/react-query';
import { WorksApi } from '@/lib/api';
import { SearchParams } from '@/types/dataTypes';

/**
 * 作品一覧を取得するためのカスタムフック
 * @param params 検索パラメータ
 */
export function useWorks(params?: SearchParams) {
  return useQuery({
    queryKey: ['works', params],
    queryFn: async () => {
      return await WorksApi.getWorks(params);
    },
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });
}

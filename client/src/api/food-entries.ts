import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  FoodEntry,
  FoodEntryListItem,
  FoodEntryListResponse,
  FoodEntryMapMarker,
  FoodEntryStatistics,
  CreateFoodEntryRequest,
  UpdateFoodEntryRequest,
  BatchDeleteRequest,
  BatchDeleteResponse,
  ImportFoodEntryRequest,
  ImportFoodEntryResponse,
} from '@shared/api.interface';

const FOOD_ENTRIES_QUERY_KEY = ['food-entries'];

export interface FoodEntryListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  minRating?: number;
  startDate?: string;
  endDate?: string;
  tagIds?: string[];
  sortBy?: 'visitDate' | 'rating';
  sortOrder?: 'asc' | 'desc';
  shareViewMode?: 'my' | 'all' | 'shared';
}

async function fetchFoodEntries(
  params: FoodEntryListParams = {},
): Promise<FoodEntryListResponse> {
  try {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.set('page', String(params.page));
    if (params.pageSize !== undefined)
      searchParams.set('pageSize', String(params.pageSize));
    if (params.keyword) searchParams.set('keyword', params.keyword);
    if (params.minRating !== undefined)
      searchParams.set('minRating', String(params.minRating));
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);
    if (params.tagIds && params.tagIds.length > 0)
      searchParams.set('tagIds', params.tagIds.join(','));
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    if (params.shareViewMode) searchParams.set('shareViewMode', params.shareViewMode);

    const queryString = searchParams.toString();
    const url = queryString
      ? `/api/food-entries?${queryString}`
      : '/api/food-entries';

    const response = await axiosForBackend({
      url,
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取美食记录列表失败', error);
    throw error;
  }
}

async function fetchFoodEntry(id: string): Promise<FoodEntry> {
  try {
    const response = await axiosForBackend({
      url: `/api/food-entries/${id}`,
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error(`获取美食记录详情失败 id=${id}`, error);
    throw error;
  }
}

async function fetchFoodEntryMarkers(shareViewMode?: 'my' | 'all' | 'shared'): Promise<FoodEntryMapMarker[]> {
  try {
    const params = new URLSearchParams();
    if (shareViewMode) params.set('shareViewMode', shareViewMode);
    const queryString = params.toString();
    const url = queryString
      ? `/api/food-entries/all?${queryString}`
      : '/api/food-entries/all';
    const response = await axiosForBackend({
      url,
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取地图标记数据失败', error);
    throw error;
  }
}

async function fetchFoodEntryStatistics(shareViewMode?: 'my' | 'all' | 'shared'): Promise<FoodEntryStatistics> {
  try {
    const response = await axiosForBackend({
      url: '/api/food-entries/statistics',
      method: 'GET',
      params: { shareViewMode },
    });
    return response.data;
  } catch (error) {
    logger.error('获取统计数据失败', error);
    throw error;
  }
}

async function createFoodEntry(
  data: CreateFoodEntryRequest,
): Promise<{ id: string }> {
  try {
    const response = await axiosForBackend({
      url: '/api/food-entries',
      method: 'POST',
      data,
    });
    return response.data;
  } catch (error) {
    logger.error('创建美食记录失败', error);
    throw error;
  }
}

async function updateFoodEntry(
  id: string,
  data: UpdateFoodEntryRequest,
): Promise<{ success: boolean }> {
  try {
    const response = await axiosForBackend({
      url: `/api/food-entries/${id}`,
      method: 'PUT',
      data,
    });
    return response.data;
  } catch (error) {
    logger.error(`更新美食记录失败 id=${id}`, error);
    throw error;
  }
}

async function deleteFoodEntry(id: string): Promise<void> {
  try {
    await axiosForBackend({
      url: `/api/food-entries/${id}`,
      method: 'DELETE',
    });
  } catch (error) {
    logger.error(`删除美食记录失败 id=${id}`, error);
    throw error;
  }
}

async function batchDeleteFoodEntries(ids: string[]): Promise<BatchDeleteResponse> {
  try {
    const body: BatchDeleteRequest = { ids };
    const response = await axiosForBackend({
      url: '/api/food-entries/batch',
      method: 'DELETE',
      data: body,
    });
    return response.data;
  } catch (error) {
    logger.error('批量删除美食记录失败', error);
    throw error;
  }
}

async function clearAllFoodEntries(): Promise<BatchDeleteResponse> {
  try {
    const response = await axiosForBackend({
      url: '/api/food-entries/all',
      method: 'DELETE',
    });
    return response.data;
  } catch (error) {
    logger.error('清空美食记录失败', error);
    throw error;
  }
}

async function importFoodEntries(
  data: ImportFoodEntryRequest,
): Promise<ImportFoodEntryResponse> {
  try {
    const response = await axiosForBackend({
      url: '/api/food-entries/import',
      method: 'POST',
      data,
    });
    return response.data;
  } catch (error) {
    logger.error('导入美食记录失败', error);
    throw error;
  }
}

export function useFoodEntries(params: FoodEntryListParams = {}) {
  return useQuery<FoodEntryListResponse, Error>({
    queryKey: [...FOOD_ENTRIES_QUERY_KEY, 'list', params],
    queryFn: () => fetchFoodEntries(params),
  });
}

export function useFoodEntry(id: string | null) {
  return useQuery<FoodEntry, Error>({
    queryKey: [...FOOD_ENTRIES_QUERY_KEY, 'detail', id],
    queryFn: () => fetchFoodEntry(id as string),
    enabled: !!id,
  });
}

export function useFoodEntryMarkers(shareViewMode?: 'my' | 'all' | 'shared') {
  return useQuery<FoodEntryMapMarker[], Error>({
    queryKey: [...FOOD_ENTRIES_QUERY_KEY, 'markers', shareViewMode],
    queryFn: () => fetchFoodEntryMarkers(shareViewMode),
  });
}

export function useFoodEntryStatistics(shareViewMode?: 'my' | 'all' | 'shared') {
  return useQuery<FoodEntryStatistics, Error>({
    queryKey: [...FOOD_ENTRIES_QUERY_KEY, 'statistics', shareViewMode],
    queryFn: () => fetchFoodEntryStatistics(shareViewMode),
  });
}

export function useCreateFoodEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFoodEntryRequest) => createFoodEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOOD_ENTRIES_QUERY_KEY });
    },
  });
}

export function useUpdateFoodEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateFoodEntryRequest;
    }) => updateFoodEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOOD_ENTRIES_QUERY_KEY });
    },
  });
}

export function useDeleteFoodEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFoodEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOOD_ENTRIES_QUERY_KEY });
    },
  });
}

export function useBatchDeleteFoodEntries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => batchDeleteFoodEntries(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOOD_ENTRIES_QUERY_KEY });
    },
  });
}

export function useClearAllFoodEntries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => clearAllFoodEntries(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOOD_ENTRIES_QUERY_KEY });
    },
  });
}

export function useImportFoodEntries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ImportFoodEntryRequest) => importFoodEntries(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOOD_ENTRIES_QUERY_KEY });
    },
  });
}

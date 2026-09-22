import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type { Tag, CreateTagRequest, UpdateTagRequest } from '@shared/api.interface';

const TAGS_QUERY_KEY = ['tags'];

async function fetchTags(): Promise<Tag[]> {
  try {
    const response = await axiosForBackend({
      url: '/api/tags',
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取标签列表失败', error);
    throw error;
  }
}

async function createTag(name: string, color?: string): Promise<Tag> {
  try {
    const body: CreateTagRequest = { name, color };
    const response = await axiosForBackend({
      url: '/api/tags',
      method: 'POST',
      data: body,
    });
    return response.data;
  } catch (error) {
    logger.error('创建标签失败', error);
    throw error;
  }
}

async function updateTag(id: string, name: string, color?: string): Promise<Tag> {
  try {
    const body: UpdateTagRequest = { name, color };
    const response = await axiosForBackend({
      url: `/api/tags/${id}`,
      method: 'PUT',
      data: body,
    });
    return response.data;
  } catch (error) {
    logger.error('更新标签失败', error);
    throw error;
  }
}

async function deleteTag(id: string): Promise<void> {
  try {
    await axiosForBackend({
      url: `/api/tags/${id}`,
      method: 'DELETE',
    });
  } catch (error) {
    logger.error('删除标签失败', error);
    throw error;
  }
}

export function useTags() {
  return useQuery<Tag[], Error>({
    queryKey: TAGS_QUERY_KEY,
    queryFn: fetchTags,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, color }: { name: string; color?: string }) =>
      createTag(name, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      name,
      color,
    }: {
      id: string;
      name: string;
      color?: string;
    }) => updateTag(id, name, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
    },
  });
}

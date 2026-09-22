import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  CollabGroup,
  CreateCollabGroupRequest,
  JoinCollabGroupRequest,
  CreateCollabGroupResponse,
  CollabGroupListResponse,
} from '@shared/api.interface';

const COLLAB_QUERY_KEY = ['collab'];

async function fetchCollabGroups(): Promise<CollabGroup[]> {
  try {
    const response = await axiosForBackend({
      url: '/api/collab/groups',
      method: 'GET',
    });
    const data: CollabGroupListResponse = response.data;
    return data.groups;
  } catch (error) {
    logger.error('获取协作组列表失败', error);
    throw error;
  }
}

async function createCollabGroup(
  data: CreateCollabGroupRequest,
): Promise<CreateCollabGroupResponse> {
  try {
    const response = await axiosForBackend({
      url: '/api/collab/groups',
      method: 'POST',
      data,
    });
    return response.data;
  } catch (error) {
    logger.error('创建协作组失败', error);
    throw error;
  }
}

async function joinCollabGroup(
  data: JoinCollabGroupRequest,
): Promise<CollabGroup> {
  try {
    const response = await axiosForBackend({
      url: '/api/collab/join',
      method: 'POST',
      data,
    });
    return response.data;
  } catch (error) {
    logger.error('加入协作组失败', error);
    throw error;
  }
}

async function leaveCollabGroup(
  groupId: string,
): Promise<{ success: boolean }> {
  try {
    const response = await axiosForBackend({
      url: `/api/collab/groups/${groupId}/leave`,
      method: 'DELETE',
    });
    return response.data;
  } catch (error) {
    logger.error('退出协作组失败', error);
    throw error;
  }
}

async function deleteCollabGroup(
  groupId: string,
): Promise<{ success: boolean }> {
  try {
    const response = await axiosForBackend({
      url: `/api/collab/groups/${groupId}`,
      method: 'DELETE',
    });
    return response.data;
  } catch (error) {
    logger.error('删除协作组失败', error);
    throw error;
  }
}

export function useCollabGroups() {
  return useQuery<CollabGroup[], Error>({
    queryKey: COLLAB_QUERY_KEY,
    queryFn: fetchCollabGroups,
  });
}

export function useCreateCollabGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCollabGroupRequest) => createCollabGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLAB_QUERY_KEY });
    },
  });
}

export function useJoinCollabGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: JoinCollabGroupRequest) => joinCollabGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLAB_QUERY_KEY });
    },
  });
}

export function useLeaveCollabGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => leaveCollabGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLAB_QUERY_KEY });
    },
  });
}

export function useDeleteCollabGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => deleteCollabGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLAB_QUERY_KEY });
    },
  });
}
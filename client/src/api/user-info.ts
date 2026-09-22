import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type { UserInfo, CreateUserInfoRequest, UpdateUserInfoRequest } from '@shared/api.interface';

const USER_INFO_QUERY_KEY = ['user-info'];

async function fetchUserInfo(): Promise<UserInfo | null> {
  try {
    const response = await axiosForBackend({
      url: '/api/user-info',
      method: 'GET',
      validateStatus: (status: number) => status === 200 || status === 204,
    });
    if (response.status === 204) return null;
    return response.data;
  } catch (error) {
    logger.error('获取用户信息失败', error);
    throw error;
  }
}

async function createUserInfo(
  data: CreateUserInfoRequest,
): Promise<UserInfo> {
  try {
    const response = await axiosForBackend({
      url: '/api/user-info',
      method: 'POST',
      data,
    });
    return response.data;
  } catch (error) {
    logger.error('创建用户信息失败', error);
    throw error;
  }
}

async function updateUserInfo(
  data: UpdateUserInfoRequest,
): Promise<UserInfo> {
  try {
    const response = await axiosForBackend({
      url: '/api/user-info',
      method: 'PUT',
      data,
    });
    return response.data;
  } catch (error) {
    logger.error('更新用户信息失败', error);
    throw error;
  }
}

export function useUserInfo() {
  return useQuery<UserInfo | null, Error>({
    queryKey: USER_INFO_QUERY_KEY,
    queryFn: fetchUserInfo,
  });
}

export function useCreateUserInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInfoRequest) => createUserInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_INFO_QUERY_KEY });
    },
  });
}

export function useUpdateUserInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserInfoRequest) => updateUserInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_INFO_QUERY_KEY });
    },
  });
}
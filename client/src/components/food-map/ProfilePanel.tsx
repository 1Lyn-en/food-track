import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Camera,
  Loader2,
  Users,
  Plus,
  LogOut,
  Copy,
  Check,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image } from '@client/src/components/ui/image';
import { useCurrentUserProfile } from '@lark-apaas/client-toolkit/hooks/useCurrentUserProfile';
import { getDataloom } from '@lark-apaas/client-toolkit/dataloom';
import { getDefaultBucketId } from '@lark-apaas/client-toolkit/tools/storage';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { useFoodMapStore } from '@client/src/store/food-map-store';
import { useUserInfo, useUpdateUserInfo } from '@client/src/api/user-info';
import {
  useCollabGroups,
  useCreateCollabGroup,
  useJoinCollabGroup,
  useLeaveCollabGroup,
  useDeleteCollabGroup,
} from '@client/src/api/collab';
import type { CollabGroup } from '@shared/api.interface';

const MAX_GROUPS = 5;

export function ProfilePanel() {
  const currentUser = useCurrentUserProfile();
  const { data: userInfo } = useUserInfo();
  const updateMutation = useUpdateUserInfo();
  const { data: groups = [], isLoading: groupsLoading } = useCollabGroups();
  const createMutation = useCreateCollabGroup();
  const joinMutation = useJoinCollabGroup();
  const leaveMutation = useLeaveCollabGroup();
  const deleteMutation = useDeleteCollabGroup();
  const isOpen = useFoodMapStore((s) => s.isProfilePanelOpen);
  const setProfilePanelOpen = useFoodMapStore((s) => s.setProfilePanelOpen);

  const inputRef = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [tab, setTab] = useState<'profile' | 'groups'>('profile');

  useEffect(() => {
    if (isOpen && userInfo) {
      setNickname(userInfo.nickname);
      setAvatarUrl(userInfo.avatar);
    }
  }, [isOpen, userInfo]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataloom = await getDataloom();
      const { data, error } = await dataloom
        .storage
        .from(getDefaultBucketId())
        .uploadFile(file);
      if (error || !data) throw new Error('上传失败');
      setAvatarUrl(data.download_url);
    } catch (err) {
      logger.error('头像上传失败', err);
      toast.error('头像上传失败');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleUpdateProfile = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      toast.error('昵称不能为空');
      return;
    }
    try {
      await updateMutation.mutateAsync({
        nickname: trimmed,
        avatar: avatarUrl,
      });
      toast.success('个人信息已更新');
    } catch (err: any) {
      toast.error(err?.message || '更新失败');
    }
  };

  const handleCreate = async () => {
    const name = newGroupName.trim();
    if (!name) return;
    if (groups.length >= MAX_GROUPS) {
      toast.error(`最多加入 ${MAX_GROUPS} 个协作组`);
      return;
    }
    try {
      const result = await createMutation.mutateAsync({ name });
      toast.success(`协作组「${name}」创建成功！分享码：${result.shareCode}`);
      setNewGroupName('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || '创建失败');
    }
  };

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    if (groups.length >= MAX_GROUPS) {
      toast.error(`最多加入 ${MAX_GROUPS} 个协作组`);
      return;
    }
    try {
      await joinMutation.mutateAsync({ shareCode: code });
      toast.success('加入成功！');
      setJoinCode('');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || '加入失败',
      );
    }
  };

  const handleLeave = async (groupId: string) => {
    try {
      await leaveMutation.mutateAsync(groupId);
      toast.success('已退出协作组');
    } catch (err: any) {
      toast.error(err?.message || '退出失败');
    }
  };

  const handleDelete = async (groupId: string) => {
    try {
      await deleteMutation.mutateAsync(groupId);
      toast.success('协作组已删除');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || '删除失败',
      );
    }
  };

  const copyShareCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const displayAvatar = avatarUrl || currentUser?.avatar || null;
  const displayName = userInfo?.nickname || currentUser?.name || '用户';

  return (
    <Dialog open={isOpen} onOpenChange={setProfilePanelOpen}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto pop-scrollbar rounded-2xl border-4 border-black shadow-[12px_12px_0_0_#000]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-4 border-black shadow-[3px_3px_0_0_#000]">
                {displayAvatar ? (
                  <Image
                    src={displayAvatar}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#FFDE00] text-xl font-black text-black">
                    {displayName.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <div>
              <DialogTitle className="pop-font text-xl font-black uppercase tracking-tight text-black">
                {displayName}
              </DialogTitle>
              <p className="text-xs font-bold text-black/40">个人信息</p>
            </div>
          </div>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex gap-2 border-b-4 border-black pb-2">
          <button
            type="button"
            onClick={() => setTab('profile')}
            className={`rounded-lg px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-colors ${
              tab === 'profile'
                ? 'bg-[#007AFF] text-white'
                : 'bg-white text-black border-2 border-black'
            }`}
          >
            编辑资料
          </button>
          <button
            type="button"
            onClick={() => setTab('groups')}
            className={`rounded-lg px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-colors ${
              tab === 'groups'
                ? 'bg-[#007AFF] text-white'
                : 'bg-white text-black border-2 border-black'
            }`}
          >
            我的群组 ({groups.length}/{MAX_GROUPS})
          </button>
        </div>

        {tab === 'profile' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 pb-2">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-black shadow-[4px_4px_0_0_#000]">
                  {displayAvatar ? (
                    <Image
                      src={displayAvatar}
                      alt="头像"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#FFDE00] text-2xl font-black text-black">
                      {displayName.charAt(0)}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-3 border-black bg-[#007AFF] text-white shadow-[2px_2px_0_0_#000] hover:bg-[#007AFF] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-widest text-black">
                昵称
              </label>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="输入昵称（最多8个字）"
                maxLength={8}
                className="h-10 rounded-xl border-4 border-black bg-white text-sm font-bold placeholder:text-black/30 focus-visible:ring-0"
              />
            </div>
            <Button
              onClick={handleUpdateProfile}
              disabled={!nickname.trim() || updateMutation.isPending}
              className="w-full h-10 rounded-xl border-4 border-black bg-[#4CD964] text-sm font-black uppercase text-black shadow-[4px_4px_0_0_#000] hover:bg-[#4CD964] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000]"
            >
              {updateMutation.isPending ? '更新中...' : '保存'}
            </Button>
          </div>
        )}

        {tab === 'groups' && (
          <div className="space-y-4">
            {/* Create */}
            <div className="rounded-2xl border-4 border-black bg-[#FFF9C4] p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-black">
                <Plus className="h-4 w-4" />
                创建协作组
              </h3>
              <div className="flex gap-2">
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="输入组名"
                  maxLength={10}
                  className="h-10 flex-1 rounded-xl border-4 border-black bg-white text-sm font-bold placeholder:text-black/30 focus-visible:ring-0"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                <Button
                  onClick={handleCreate}
                  disabled={!newGroupName.trim() || createMutation.isPending}
                  className="h-10 shrink-0 rounded-xl border-4 border-black bg-[#4CD964] text-sm font-black uppercase text-black shadow-[3px_3px_0_0_#000] hover:bg-[#4CD964] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000]"
                >
                  创建
                </Button>
              </div>
            </div>

            {/* Join */}
            <div className="rounded-2xl border-4 border-black bg-[#FFF9C4] p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-black">
                <Users className="h-4 w-4" />
                加入协作组
              </h3>
              <div className="flex gap-2">
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="6位分享码"
                  maxLength={6}
                  className="h-10 w-32 rounded-xl border-4 border-black bg-white text-center text-sm font-black tracking-widest placeholder:text-black/30 focus-visible:ring-0"
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                />
                <Button
                  onClick={handleJoin}
                  disabled={joinCode.length !== 6 || joinMutation.isPending}
                  className="h-10 flex-1 rounded-xl border-4 border-black bg-[#007AFF] text-sm font-black uppercase text-white shadow-[3px_3px_0_0_#000] hover:bg-[#007AFF] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000]"
                >
                  加入
                </Button>
              </div>
            </div>

            {/* Groups list */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-black">
                <Users className="h-4 w-4" />
                我的群组
                <span className="rounded-full border-2 border-black bg-[#007AFF] px-2 py-0.5 text-xs text-white">
                  {groups.length}/{MAX_GROUPS}
                </span>
              </h3>
              {groupsLoading ? (
                <p className="text-center text-sm font-bold text-black/40">
                  加载中...
                </p>
              ) : groups.length === 0 ? (
                <p className="rounded-2xl border-4 border-dashed border-black/20 bg-white p-6 text-center text-sm font-bold text-black/40">
                  还没有加入任何群组
                </p>
              ) : (
                <div className="space-y-3">
                  {groups.map((group: CollabGroup) => {
                    const isOwner = group.createdBy === currentUser?.user_id;
                    return (
                      <div
                        key={group.id}
                        className="flex items-center justify-between rounded-2xl border-4 border-black bg-white p-3 shadow-[4px_4px_0_0_#000]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-black uppercase text-black">
                              {group.name}
                            </p>
                            {isOwner && (
                              <span className="shrink-0 rounded-full border-2 border-black bg-[#FFDE00] px-1.5 py-0.5 text-[10px] font-black uppercase text-black">
                                创建者
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => copyShareCode(group.shareCode)}
                              className="inline-flex items-center gap-1 rounded-lg border-2 border-black bg-[#FFDE00] px-2 py-0.5 text-xs font-black uppercase text-black hover:bg-[#FFCC00]"
                            >
                              {group.shareCode}
                              {copiedCode === group.shareCode ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                            <span className="text-xs font-bold text-black/40">
                              {group.memberCount}/5
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {isOwner && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(group.id)}
                              className="h-8 w-8 rounded-lg border-2 border-black bg-white text-black hover:bg-[#FF3B30] hover:text-white"
                              aria-label="删除协作组"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleLeave(group.id)}
                            className="h-8 w-8 rounded-lg border-2 border-black bg-white text-black hover:bg-[#FF3B30] hover:text-white"
                            aria-label="退出协作组"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
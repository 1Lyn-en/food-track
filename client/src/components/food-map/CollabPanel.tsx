import { useState } from 'react';
import { toast } from 'sonner';
import { Users, Plus, LogOut, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useCollabGroups,
  useCreateCollabGroup,
  useJoinCollabGroup,
  useLeaveCollabGroup,
} from '@client/src/api/collab';
import type { CollabGroup } from '@shared/api.interface';

interface CollabPanelProps {
  open: boolean;
  onClose: () => void;
}

export function CollabPanel({ open, onClose }: CollabPanelProps) {
  const { data: groups = [], isLoading } = useCollabGroups();
  const createMutation = useCreateCollabGroup();
  const joinMutation = useJoinCollabGroup();
  const leaveMutation = useLeaveCollabGroup();

  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCreate = async () => {
    const name = newGroupName.trim();
    if (!name) return;
    try {
      const result = await createMutation.mutateAsync({ name });
      toast.success(`协作组「${name}」创建成功！分享码：${result.shareCode}`);
      setNewGroupName('');
    } catch (err: any) {
      toast.error(err?.message || '创建失败');
    }
  };

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
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

  const copyShareCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto pop-scrollbar rounded-2xl border-4 border-black shadow-[12px_12px_0_0_#000]">
        <DialogHeader>
          <DialogTitle className="pop-font text-2xl font-black uppercase tracking-tight text-black">
            美食协作组
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* 创建协作组 */}
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
                className="h-10 rounded-xl border-4 border-black bg-white text-sm font-bold placeholder:text-black/30 focus-visible:ring-0"
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

          {/* 加入协作组 */}
          <div className="rounded-2xl border-4 border-black bg-[#FFF9C4] p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-black">
              <Users className="h-4 w-4" />
              加入协作组
            </h3>
            <div className="flex gap-2">
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="输入6位分享码"
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

          {/* 我的协作组 */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-black">
              <Users className="h-4 w-4" />
              我的协作组
              {groups.length > 0 && (
                <span className="rounded-full border-2 border-black bg-[#007AFF] px-2 py-0.5 text-xs text-white">
                  {groups.length}
                </span>
              )}
            </h3>
            {isLoading ? (
              <p className="text-center text-sm font-bold text-black/40">
                加载中...
              </p>
            ) : groups.length === 0 ? (
              <p className="rounded-2xl border-4 border-dashed border-black/20 bg-white p-6 text-center text-sm font-bold text-black/40">
                还没有加入任何协作组
              </p>
            ) : (
              <div className="space-y-3">
                {groups.map((group: CollabGroup) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between rounded-2xl border-4 border-black bg-white p-3 shadow-[4px_4px_0_0_#000]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black uppercase text-black">
                        {group.name}
                      </p>
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
                          {group.memberCount}/5 人
                        </span>
                      </div>
                    </div>
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
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
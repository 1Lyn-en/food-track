import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { UtensilsCrossed, Camera, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image } from '@client/src/components/ui/image';
import { getDataloom } from '@lark-apaas/client-toolkit/dataloom';
import { getDefaultBucketId } from '@lark-apaas/client-toolkit/tools/storage';
import { useCurrentUserProfile } from '@lark-apaas/client-toolkit/hooks/useCurrentUserProfile';
import { logger } from '@lark-apaas/client-toolkit/logger';

interface ProfileSetupDialogProps {
  open: boolean;
  onSave: (nickname: string, avatarUrl: string | null) => Promise<void>;
}

export function ProfileSetupDialog({ open, onSave }: ProfileSetupDialogProps) {
  const currentUser = useCurrentUserProfile();
  const defaultAvatar = currentUser?.avatar || null;
  const inputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(defaultAvatar);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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
      toast.error('头像上传失败，请重试');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await onSave(trimmed, avatarUrl);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-sm rounded-2xl border-4 border-black shadow-[12px_12px_0_0_#000]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-black bg-[#FF3B30] shadow-[4px_4px_0_0_#000]">
            <UtensilsCrossed className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="pop-font text-center text-2xl font-black uppercase tracking-tight text-black">
            欢迎来到食迹
          </DialogTitle>
          <DialogDescription className="text-center text-sm font-bold text-black/60">
            设置你的头像和昵称，开始记录美食之旅！
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-black shadow-[4px_4px_0_0_#000]">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="头像"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#FFDE00] text-2xl font-black text-black">
                    ?
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
            <p className="text-xs font-bold text-black/40">
              点击相机图标上传头像（默认使用飞书头像）
            </p>
          </div>

          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="输入你的昵称（最多8个字）"
            maxLength={8}
            className="h-12 rounded-xl border-4 border-black bg-white text-center text-lg font-black placeholder:text-black/30 focus-visible:ring-0"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          <Button
            onClick={handleSave}
            disabled={!nickname.trim() || saving}
            className="w-full h-12 rounded-xl border-4 border-black bg-[#4CD964] text-lg font-black uppercase tracking-widest text-black shadow-[4px_4px_0_0_#000] hover:bg-[#4CD964] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000] disabled:opacity-50"
          >
            {saving ? '设置中...' : '开始探索'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
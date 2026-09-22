import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UtensilsCrossed } from 'lucide-react';

interface NicknameDialogProps {
  open: boolean;
  onSave: (nickname: string) => Promise<void>;
}

export function NicknameDialog({ open, onSave }: NicknameDialogProps) {
  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await onSave(trimmed);
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
            设置你的昵称，开始记录美食之旅！
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
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
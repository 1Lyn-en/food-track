import { useState, type ChangeEvent } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useClearAllFoodEntries } from '@/api/food-entries';

const CLEAR_CONFIRM_TEXT = '确认清空';

export function ClearTab() {
  const [confirmText, setConfirmText] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const clearAll = useClearAllFoodEntries();

  const canClear = confirmText === CLEAR_CONFIRM_TEXT;

  const handleClear = (): void => {
    if (!canClear) return;
    setConfirmOpen(true);
  };

  const confirmClear = (): void => {
    clearAll.mutate(undefined, {
      onSuccess: (res) => {
        toast.success(`已清空 ${res.deletedCount} 条记录`);
        setConfirmText('');
        setConfirmOpen(false);
      },
      onError: () => {
        toast.error('清空失败，请重试');
      },
    });
  };

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="size-4" />
        <AlertTitle>危险操作</AlertTitle>
        <AlertDescription>
          清空所有美食记录数据，包括所有菜品、评分和标签关联。此操作不可撤销，请谨慎操作。
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="clear-confirm">
          请输入{' '}
          <span className="font-medium text-destructive">
            {CLEAR_CONFIRM_TEXT}
          </span>{' '}
          以继续
        </Label>
        <Input
          id="clear-confirm"
          value={confirmText}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setConfirmText(e.target.value)
          }
          placeholder={CLEAR_CONFIRM_TEXT}
        />
      </div>

      <Button
        variant="destructive"
        className="w-full"
        disabled={!canClear || clearAll.isPending}
        onClick={handleClear}
      >
        <Trash2 className="size-4" />
        {clearAll.isPending ? '清空中...' : '清空所有数据'}
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>最后确认：清空所有数据？</AlertDialogTitle>
            <AlertDialogDescription>
              所有美食记录将被永久删除，无法恢复。确定要继续吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClear}
              className="bg-destructive hover:bg-destructive/90"
            >
              确认清空
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

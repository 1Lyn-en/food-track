import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
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

import { useFoodEntries, useBatchDeleteFoodEntries } from '@/api/food-entries';
import type { FoodEntryListItem } from '@shared/api.interface';

export function BatchDeleteTab() {
  const { data, isLoading } = useFoodEntries({ pageSize: 100 });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const batchDelete = useBatchDeleteFoodEntries();
  const items: FoodEntryListItem[] = data?.items ?? [];
  const allSelected = items.length > 0 && selectedIds.size === items.length;

  const toggleAll = (checked: boolean): void => {
    if (checked) {
      setSelectedIds(new Set(items.map((i: FoodEntryListItem) => i.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleOne = (id: string, checked: boolean): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleDelete = (): void => {
    if (selectedIds.size === 0) return;
    setConfirmOpen(true);
  };

  const confirmDelete = (): void => {
    batchDelete.mutate(Array.from(selectedIds), {
      onSuccess: (res) => {
        toast.success(`已删除 ${res.deletedCount} 条记录`);
        setSelectedIds(new Set());
        setConfirmOpen(false);
      },
      onError: () => {
        toast.error('删除失败，请重试');
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          共 {items.length} 条记录，已选{' '}
          <span className="font-medium text-foreground">
            {selectedIds.size}
          </span>{' '}
          条
        </div>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleAll(!allSelected)}
            className="h-7 text-xs"
          >
            {allSelected ? '取消全选' : '全选'}
          </Button>
        )}
      </div>

      <ScrollArea className="h-[280px] rounded-md border">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            加载中...
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            暂无记录
          </div>
        ) : (
          <div className="divide-y">
            {items.map((item: FoodEntryListItem) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-3 py-2.5 transition-colors data-[selected=true]:bg-accent/50"
                data-selected={selectedIds.has(item.id)}
              >
                <Checkbox
                  checked={selectedIds.has(item.id)}
                  onCheckedChange={(checked: boolean) =>
                    toggleOne(item.id, checked)
                  }
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {item.dishName}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {item.restaurantName}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.visitDate.slice(0, 10)}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <Button
        variant="destructive"
        className="w-full"
        disabled={selectedIds.size === 0 || batchDelete.isPending}
        onClick={handleDelete}
      >
        <Trash2 className="size-4" />
        删除选中的 {selectedIds.size} 条记录
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量删除？</AlertDialogTitle>
            <AlertDialogDescription>
              将删除 {selectedIds.size} 条美食记录，此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

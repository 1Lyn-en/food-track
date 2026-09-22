import { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Pencil,
  Trash2,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFoodEntry } from '@client/src/api/food-entries';
import { useCurrentUserProfile } from '@lark-apaas/client-toolkit/hooks/useCurrentUserProfile';
import { DetailDrawerContent } from './DetailDrawerContent';

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  entryId: string | null;
  onPrev?: () => void;
  onNext?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function DetailDrawer({
  open,
  onClose,
  entryId,
  onPrev,
  onNext,
  onEdit,
  onDelete,
  hasPrev = false,
  hasNext = false,
}: DetailDrawerProps) {
  const { data: entry, isLoading, error } = useFoodEntry(entryId);
  const currentUser = useCurrentUserProfile();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOwner = entry && currentUser && entry.userId === currentUser.user_id;
  const canEdit = !!(onEdit && isOwner);
  const canDelete = !!(onDelete && isOwner);

  useEffect(() => {
    if (open) setShowDeleteConfirm(false);
  }, [open, entryId]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showDeleteConfirm) onClose();
    };
    document.addEventListener('keydown', handleKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, showDeleteConfirm, onClose]);

  const handleCopyInfo = useCallback(async () => {
    if (!entry) return;
    const tags = entry.tags?.map((t) => t.name).join('、') || '';
    const lines = [
      `🍽️ ${entry.dishName}`,
      `📍 ${entry.restaurantName}`,
      `📌 ${entry.address}`,
      `⭐ 评分：${entry.rating}/5`,
      `📅 用餐日期：${entry.visitDate.slice(0, 10)}`,
      tags && `🏷️ 标签：${tags}`,
      entry.note && `📝 备注：${entry.note}`,
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
    } catch {
      /* 忽略复制失败 */
    }
  }, [entry]);

  const handleOpenAmap = useCallback(() => {
    if (!entry) return;
    const url = `https://uri.amap.com/marker?position=${entry.longitude},${entry.latitude}&name=${encodeURIComponent(entry.restaurantName)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [entry]);

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete?.();
  };

  return (
    <>
      {/* 遮罩 */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden
      />

      {/* 抽屉 */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full flex-col',
          'w-[480px] max-w-[90vw]',
          'bg-card border-l-4 border-black shadow-[-8px_0_0_0_#000] transition-transform duration-300 ease-out max-sm:w-full max-sm:max-w-full',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="美食记录详情"
      >
        {/* 关闭按钮 */}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'absolute right-3 top-3 z-50 flex h-9 w-9 items-center justify-center',
            'rounded-full border-2 border-black bg-white text-black shadow-[3px_3px_0_0_#000] transition-colors hover:bg-[#FFDE00] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]',
          )}
          aria-label="关闭"
          data-close-drawer="true"
        >
          <X className="h-5 w-5" />
        </button>

        {isLoading && <DetailSkeleton />}

        {error && (
          <div className="flex flex-1 items-center justify-center p-6 text-muted-foreground">
            加载失败，请稍后重试
          </div>
        )}

        {!isLoading && !error && entry && (
          <div className="relative flex h-full flex-col">
            <DetailDrawerContent entry={entry} />

            {/* 底部操作栏 */}
            <div className="border-t-4 border-black bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={onPrev}
                    disabled={!hasPrev}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl border-4 border-black bg-white text-black font-black uppercase shadow-[3px_3px_0_0_#000] transition-colors active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]',
                      hasPrev ? 'hover:bg-[#FFDE00]' : 'cursor-not-allowed opacity-50',
                    )}
                    aria-label="上一条"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={onNext}
                    disabled={!hasNext}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl border-4 border-black bg-white text-black font-black uppercase shadow-[3px_3px_0_0_#000] transition-colors active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]',
                      hasNext ? 'hover:bg-[#FFDE00]' : 'cursor-not-allowed opacity-50',
                    )}
                    aria-label="下一条"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleCopyInfo}
                    className="flex h-9 items-center gap-1.5 rounded-xl border-4 border-black bg-white px-3 text-sm font-black uppercase text-black shadow-[3px_3px_0_0_#000] transition-colors hover:bg-[#FFDE00] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]"
                    title="复制信息"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="hidden sm:inline">复制</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenAmap}
                    className="flex h-9 items-center gap-1.5 rounded-xl border-4 border-black bg-white px-3 text-sm font-black uppercase text-black shadow-[3px_3px_0_0_#000] transition-colors hover:bg-[#FFDE00] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]"
                    title="在高德地图打开"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="hidden sm:inline">地图</span>
                  </button>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={onEdit}
                      className="flex h-9 items-center gap-1.5 rounded-xl border-4 border-black bg-[#007AFF] px-3 text-sm font-black uppercase text-white shadow-[3px_3px_0_0_#000] transition-colors active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]"
                      title="编辑"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="hidden sm:inline">编辑</span>
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex h-9 items-center gap-1.5 rounded-xl border-4 border-black bg-[#FF3B30] px-3 text-sm font-black uppercase text-white shadow-[3px_3px_0_0_#000] transition-colors active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]"
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">删除</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 删除确认 */}
            {showDeleteConfirm && (
              <div
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/40"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <div
                  className="mx-6 w-full max-w-sm rounded-2xl border-4 border-black bg-card p-6 shadow-[8px_8px_0_0_#000]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-black uppercase tracking-tight text-foreground">
                    确认删除
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    删除后无法恢复，确定要删除这条美食记录吗？
                  </p>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="rounded-xl border-4 border-black bg-white px-4 py-2 text-sm font-black uppercase text-black shadow-[4px_4px_0_0_#000] transition-colors hover:bg-[#FFDE00] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000]"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      className="rounded-xl border-4 border-black bg-[#FF3B30] px-4 py-2 text-sm font-black uppercase text-white shadow-[4px_4px_0_0_#000] transition-colors active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000]"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="aspect-[4/3] w-full animate-pulse bg-black/10" />
      <div className="flex-1 space-y-4 p-6">
        <div className="h-6 w-3/4 animate-pulse rounded bg-black/10" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-black/10" />
        <div className="h-5 w-24 animate-pulse rounded bg-black/10" />
        <div className="flex gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-black/10" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-black/10" />
        </div>
        <div className="h-4 w-full animate-pulse rounded bg-black/10" />
        <div className="h-24 w-full animate-pulse rounded bg-black/10" />
      </div>
      <div className="border-t-4 border-black p-4">
        <div className="flex items-center justify-between">
          <div className="h-9 w-20 animate-pulse rounded-xl bg-black/10" />
          <div className="h-9 w-40 animate-pulse rounded-xl bg-black/10" />
        </div>
      </div>
      <MapPin className="hidden" />
    </div>
  );
}

export default DetailDrawer;

import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { Image } from '@client/src/components/ui/image';

interface ImageLightboxProps {
  images: string[];
  index: number;
  open: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export function ImageLightbox({
  images,
  index,
  open,
  onClose,
  onPrev,
  onNext,
}: ImageLightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onPrev?.();
      } else if (e.key === 'ArrowRight') {
        onNext?.();
      }
    },
    [open, onClose, onPrev, onNext],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPrev?.();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNext?.();
  };

  if (!open || images.length === 0) return null;

  const currentSrc = images[index];
  const hasPrev = index > 0;
  const hasNext = index < images.length - 1;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center',
        'bg-black/80 backdrop-blur-sm',
        'animate-in fade-in duration-200',
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
    >
      {/* 关闭按钮 */}
      <button
        type="button"
        onClick={onClose}
        className={cn(
          'absolute right-6 top-6 flex h-10 w-10 items-center justify-center',
          'rounded-full bg-white/10 text-white transition-colors hover:bg-white/20',
        )}
        aria-label="关闭"
      >
        <X className="h-5 w-5" />
      </button>

      {/* 左箭头 */}
      {hasPrev && (
        <button
          type="button"
          onClick={handlePrev}
          className={cn(
            'absolute left-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center',
            'rounded-full bg-white/10 text-white transition-colors hover:bg-white/20',
          )}
          aria-label="上一张"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* 图片 */}
      <div className="flex max-h-[90vh] max-w-[90vw] items-center justify-center">
        <Image
          src={currentSrc}
          alt={`图片 ${index + 1}`}
          className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
          onError={() => {
            logger.warn(`图片加载失败: ${currentSrc}`);
          }}
        />
      </div>

      {/* 右箭头 */}
      {hasNext && (
        <button
          type="button"
          onClick={handleNext}
          className={cn(
            'absolute right-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center',
            'rounded-full bg-white/10 text-white transition-colors hover:bg-white/20',
          )}
          aria-label="下一张"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* 序号 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-sm text-white">
        {index + 1} / {images.length}
      </div>
    </div>
  );
}

export default ImageLightbox;

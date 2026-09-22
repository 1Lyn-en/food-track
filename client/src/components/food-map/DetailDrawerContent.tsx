import { useState, useCallback, useEffect } from 'react';
import {
  Star,
  MapPin,
  Calendar,
  Copy,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type { FoodEntry } from '@shared/api.interface';
import { Image } from '@client/src/components/ui/image';
import { ImageLightbox } from './ImageLightbox';

interface DetailDrawerContentProps {
  entry: FoodEntry;
}

export function DetailDrawerContent({ entry }: DetailDrawerContentProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLightboxIndex(0);
  }, [entry.id]);

  const handleCopyAddress = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(entry.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('复制地址失败', err);
    }
  }, [entry.address]);

  const handlePrev = useCallback(() => {
    setLightboxIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setLightboxIndex((prev) => Math.min(entry.images.length - 1, prev + 1));
  }, [entry.images.length]);

  const images = entry.images ?? [];

  return (
    <>
      {/* 图片区 */}
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#FFF9C4]">
        {images.length > 0 ? (
          <>
            <Image
              src={images[lightboxIndex]}
              alt={entry.dishName}
              className="h-full w-full cursor-zoom-in object-cover"
              onClick={() => setLightboxOpen(true)}
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className={cn(
                    'absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center',
                    'rounded-full border-2 border-black bg-white text-black shadow-[2px_2px_0_0_#000] transition-colors hover:bg-[#FFDE00]',
                    lightboxIndex === 0 && 'opacity-50',
                  )}
                  aria-label="上一张"
                  disabled={lightboxIndex === 0}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className={cn(
                    'absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center',
                    'rounded-full border-2 border-black bg-white text-black shadow-[2px_2px_0_0_#000] transition-colors hover:bg-[#FFDE00]',
                    lightboxIndex === images.length - 1 && 'opacity-50',
                  )}
                  aria-label="下一张"
                  disabled={lightboxIndex === images.length - 1}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 right-3 rounded-full border-2 border-black bg-black px-3 py-1 text-xs font-bold uppercase text-white">
                  {lightboxIndex + 1} / {images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <MapPin className="h-16 w-16 opacity-20" />
          </div>
        )}
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
        <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
          {entry.restaurantName}
        </h2>
        <h3 className="mt-1 text-lg font-black uppercase tracking-tight text-foreground/90">
          {entry.dishName}
        </h3>

        {/* 评分 */}
        <div className="mt-3 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const filled = i < Math.round(entry.rating);
            return (
              <Star
                key={i}
                className={cn(
                  'h-5 w-5',
                  filled
                    ? 'fill-[#FFDE00] text-black'
                    : 'text-black/30',
                )}
              />
            );
          })}
          <span className="ml-2 text-sm font-black uppercase text-foreground">
            {entry.rating.toFixed(1)}
          </span>
        </div>

        {/* 标签 */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-full border-2 border-black bg-[#FFDE00] px-3 py-1 text-xs font-black uppercase text-black"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* 地址 */}
        <div className="mt-5 flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="flex-1 text-sm font-bold uppercase text-foreground">{entry.address}</p>
          <button
            type="button"
            onClick={handleCopyAddress}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-black bg-white text-black shadow-[2px_2px_0_0_#000] transition-colors hover:bg-[#FFDE00]"
            aria-label="复制地址"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* 用餐日期 */}
        <div className="mt-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-bold uppercase text-foreground">{entry.visitDate.slice(0, 10)}</span>
        </div>

        {/* 备注 */}
        {entry.note && (
          <div className="mt-5">
            <h4 className="text-sm font-black uppercase tracking-widest text-foreground">备注</h4>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {entry.note}
            </p>
          </div>
        )}

        {/* 创建/更新时间 */}
        <div className="mt-6 text-xs text-muted-foreground">
          <p>创建于 {new Date(entry.createdAt).toLocaleString('zh-CN')}</p>
          <p>更新于 {new Date(entry.updatedAt).toLocaleString('zh-CN')}</p>
        </div>
      </div>

      <ImageLightbox
        images={images}
        index={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </>
  );
}

export default DetailDrawerContent;

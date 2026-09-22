import { Star, MapPin, Pencil, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Image } from '@client/src/components/ui/image';
import type { FoodEntryListItem } from '@shared/api.interface';

interface MapPreviewCardProps {
  entry: FoodEntryListItem;
  scale: number;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function MapPreviewCard({
  entry,
  scale,
  isOwner,
  onEdit,
  onDelete,
  onClose,
}: MapPreviewCardProps) {
  const firstImage = entry.images?.[0];

  const stopBubble = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="pointer-events-auto flex flex-col items-center"
      style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}
      onClick={stopBubble}
      onMouseDown={stopBubble}
      role="dialog"
      aria-label="店铺信息"
    >
      {/* 卡片本体 */}
      <div className="relative w-[300px] overflow-hidden rounded-2xl border-4 border-black bg-card shadow-[10px_10px_0_0_#000]">
        {/* 关闭按钮 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white text-black shadow-[3px_3px_0_0_#000] transition-colors hover:bg-[#FF3B30] hover:text-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]"
          aria-label="关闭"
        >
          <X className="h-4 w-4" />
        </button>

        {/* 缩略图 */}
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b-4 border-black bg-[#FFF9C4]">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={entry.dishName}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <MapPin className="h-10 w-10 opacity-30" />
            </div>
          )}
        </div>

        {/* 内容区 */}
        <div className="flex flex-col gap-2 p-4">
          {!isOwner && entry.creatorNickname && (
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full border-1.5 border-black"
                style={{ backgroundColor: entry.creatorColor || '#007AFF' }}
              />
              <span className="text-[11px] font-bold text-black/50">
                由 {entry.creatorNickname} 分享
              </span>
            </div>
          )}
          <div className="flex items-start justify-between gap-2 pr-6">
            <h3 className="line-clamp-1 text-lg font-black uppercase tracking-tight text-black">
              {entry.dishName}
            </h3>
            <div className="flex shrink-0 items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < Math.round(entry.rating);
                return (
                  <Star
                    key={i}
                    className={cn(
                      'h-4 w-4',
                      filled ? 'fill-[#FFDE00] text-black' : 'text-black/20',
                    )}
                  />
                );
              })}
            </div>
          </div>

          <p className="line-clamp-1 text-sm font-bold text-black/60">
            {entry.restaurantName}
          </p>

          <div className="flex items-start gap-1.5 text-xs font-bold text-black/50">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-2">{entry.address}</span>
          </div>

          {/* 操作按钮 */}
          {isOwner && (
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border-4 border-black bg-[#007AFF] text-sm font-black uppercase text-white shadow-[3px_3px_0_0_#000] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]"
            >
              <Pencil className="h-4 w-4" />
              编辑
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border-4 border-black bg-[#FF3B30] text-sm font-black uppercase text-white shadow-[3px_3px_0_0_#000] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]"
            >
              <Trash2 className="h-4 w-4" />
              删除
            </button>
          </div>
          )}
        </div>
      </div>

      {/* 指向图标的连接箭头 */}
      <div className="-mt-[3px] h-0 w-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-black" />

      {/* 水滴图标（与卡片同一覆盖物，随地图缩放一起放缩） */}
      <div className="relative mt-0.5 h-[46px] w-9">
        <div className="absolute left-0 top-0 flex h-9 w-9 rotate-[-45deg] items-center justify-center rounded-[50%_50%_50%_0] border-[3px] border-black bg-[#FFDE00] shadow-[4px_4px_0_0_#000]">
          <div className="flex rotate-45 items-center gap-0.5 text-[11px] font-black text-black">
            <Star className="h-3 w-3 fill-black text-black" />
            {entry.rating.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapPreviewCard;

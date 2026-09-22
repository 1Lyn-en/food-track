import { Star, MapPin, Calendar, Pencil, Trash2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FoodEntryListItem } from '@shared/api.interface';
import { Image } from '@client/src/components/ui/image';

interface FoodEntryCardProps {
  entry: FoodEntryListItem;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function FoodEntryCard({
  entry,
  onClick,
  onEdit,
  onDelete,
}: FoodEntryCardProps) {
  const firstImage = entry.images?.[0];
  const visibleTags = entry.tags?.slice(0, 3) ?? [];
  const extraTagCount = (entry.tags?.length ?? 0) - 3;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'group flex cursor-pointer flex-col overflow-hidden rounded-2xl border-4 border-black bg-card shadow-[6px_6px_0_0_#000] transition-all duration-200',
        'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#000]',
      )}
    >
      {/* 图片区 */}
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b-4 border-black bg-[#FFF9C4]">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={entry.dishName}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <MapPin className="h-10 w-10 opacity-30" />
          </div>
        )}

        {/* 操作按钮 */}
        {(onEdit || onDelete) && (
          <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {onEdit && (
              <button
                type="button"
                onClick={handleEdit}
                className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-white text-black shadow-[2px_2px_0_0_#000] transition-colors hover:bg-[#007AFF] hover:text-white"
                aria-label="编辑"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-white text-black shadow-[2px_2px_0_0_#000] transition-colors hover:bg-[#FF3B30] hover:text-white"
                aria-label="删除"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 内容区 */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-lg font-black uppercase tracking-tight text-black">
            {entry.dishName}
          </h3>
          {/* 评分 */}
          <div className="flex shrink-0 items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => {
              const filled = i < Math.round(entry.rating);
              return (
                <Star
                  key={i}
                  className={cn(
                    'h-4 w-4',
                    filled
                      ? 'fill-[#FFDE00] text-black'
                      : 'text-black/20',
                  )}
                />
              );
            })}
          </div>
        </div>

        <p className="line-clamp-1 text-sm font-bold text-black/60">
          {entry.restaurantName}
        </p>

        {entry.creatorNickname && (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-black bg-[#4CD964] px-2 py-0.5 text-[10px] font-black uppercase text-black">
              <Users className="h-3 w-3" />
              协作
            </span>
            <span
              className="inline-block h-3 w-3 rounded-full border-2 border-black"
              style={{ backgroundColor: entry.creatorColor || '#000' }}
            />
            <span className="text-xs font-bold text-black/50">
              {entry.creatorNickname}
            </span>
          </div>
        )}

        {/* 标签 */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {visibleTags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-full border-2 border-black bg-[#FFDE00] px-2.5 py-0.5 text-xs font-black uppercase text-black"
              >
                {tag.name}
              </span>
            ))}
            {extraTagCount > 0 && (
              <span className="inline-flex items-center rounded-full border-2 border-black bg-white px-2.5 py-0.5 text-xs font-black text-black">
                +{extraTagCount}
              </span>
            )}
          </div>
        )}

        {/* 日期 */}
        <div className="mt-auto flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black/50">
          <Calendar className="h-3.5 w-3.5" />
          <span>{entry.visitDate.slice(0, 10)}</span>
        </div>
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TagCloudTag {
  id: string;
  name: string;
  color: string;
  usageCount: number;
}

interface TagCloudProps {
  tags: TagCloudTag[];
  onTagClick?: (tagId: string) => void;
  selectedIds?: string[];
}

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 24;

export function TagCloud({
  tags,
  onTagClick,
  selectedIds = [],
}: TagCloudProps) {
  const { maxCount, minCount } = useMemo(() => {
    if (tags.length === 0) {
      return { maxCount: 0, minCount: 0 };
    }
    const counts = tags.map((t) => t.usageCount);
    return {
      maxCount: Math.max(...counts),
      minCount: Math.min(...counts),
    };
  }, [tags]);

  const getFontSize = (usageCount: number): number => {
    if (maxCount === minCount) return (MIN_FONT_SIZE + MAX_FONT_SIZE) / 2;
    const ratio = (usageCount - minCount) / (maxCount - minCount);
    return MIN_FONT_SIZE + ratio * (MAX_FONT_SIZE - MIN_FONT_SIZE);
  };

  if (tags.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        暂无标签
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2" data-ai-section-type="card-list">
      {tags.map((tag: TagCloudTag) => {
        const isSelected = selectedIds.includes(tag.id);
        const fontSize = getFontSize(tag.usageCount);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onTagClick?.(tag.id)}
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1 transition-all duration-150',
              isSelected
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-accent text-accent-foreground hover:bg-accent/80',
            )}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: 1.4,
              color: isSelected ? undefined : tag.color,
            }}
            aria-pressed={isSelected}
          >
            <span
              className={cn(
                'mr-1.5 h-2 w-2 rounded-full',
                isSelected ? 'bg-primary-foreground/80' : '',
              )}
              style={{ backgroundColor: isSelected ? undefined : tag.color }}
              aria-hidden
            />
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}

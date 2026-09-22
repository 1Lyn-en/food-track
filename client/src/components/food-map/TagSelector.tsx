import { useState, useMemo, useRef, useEffect } from 'react';
import { X, Plus, Search, Tag as TagIcon } from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTags, useCreateTag } from '@/api/tags';
import { cn } from '@/lib/utils';
import type { Tag } from '@shared/api.interface';

interface TagSelectorProps {
  value: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

export function TagSelector({
  value,
  onChange,
  placeholder = '选择标签',
}: TagSelectorProps) {
  const { data: tags, isLoading } = useTags();
  const createTagMutation = useCreateTag();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedTags = useMemo(() => {
    if (!tags) return [];
    return tags.filter((tag: Tag) => value.includes(tag.id));
  }, [tags, value]);

  const filteredTags = useMemo(() => {
    if (!tags) return [];
    const keyword = search.trim().toLowerCase();
    if (!keyword) return tags;
    return tags.filter((tag: Tag) =>
      tag.name.toLowerCase().includes(keyword),
    );
  }, [tags, search]);

  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleToggle = (tagId: string) => {
    if (value.includes(tagId)) {
      onChange(value.filter((id) => id !== tagId));
    } else {
      onChange([...value, tagId]);
    }
  };

  const handleRemove = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((id) => id !== tagId));
  };

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    try {
      const newTag = await createTagMutation.mutateAsync({ name });
      if (!value.includes(newTag.id)) {
        onChange([...value, newTag.id]);
      }
      setNewTagName('');
    } catch (error) {
      logger.error('快速创建标签失败', error);
    }
  };

  const handleCreateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateTag();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm transition-[color,box-shadow] outline-none hover:border-ring focus-visible:border-ring focus-visible:ring-ring/20 focus-visible:ring-[3px]"
          onClick={() => setOpen(true)}
        >
          {selectedTags.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            selectedTags.map((tag: Tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs text-primary-foreground"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full bg-primary-foreground/80"
                  aria-hidden
                />
                {tag.name}
                <button
                  type="button"
                  onClick={(e) => handleRemove(tag.id, e)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-primary-foreground/20"
                  aria-label={`删除标签 ${tag.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[320px] p-0"
        align="start"
        sideOffset={4}
      >
        <div className="flex flex-col">
          {/* 搜索框 */}
          <div className="relative border-b border-border p-2">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索标签..."
              className="pl-8"
            />
          </div>

          {/* 标签列表 */}
          <div className="max-h-56 overflow-y-auto pop-scrollbar p-2">
            {isLoading ? (
              <div className="space-y-2 py-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-7 w-full animate-pulse rounded-md bg-accent"
                  />
                ))}
              </div>
            ) : filteredTags.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                暂无匹配的标签
              </div>
            ) : (
              <ul className="space-y-1">
                {filteredTags.map((tag: Tag) => {
                  const isSelected = value.includes(tag.id);
                  return (
                    <li key={tag.id}>
                      <button
                        type="button"
                        onClick={() => handleToggle(tag.id)}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                          isSelected
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent/60',
                        )}
                      >
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                          aria-hidden
                        />
                        <span className="flex-1 text-left">{tag.name}</span>
                        {isSelected && (
                          <TagIcon className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* 新建标签 */}
          <div className="flex items-center gap-2 border-t border-border p-2">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={handleCreateKeyDown}
              placeholder="输入新标签名称..."
              className="flex-1"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleCreateTag}
              disabled={!newTagName.trim() || createTagMutation.isPending}
            >
              <Plus className="h-4 w-4" />
              新建
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

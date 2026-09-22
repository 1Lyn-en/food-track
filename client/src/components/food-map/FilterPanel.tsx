import { useState } from 'react';
import { Star, Calendar, Tag, RotateCcw, X, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@client/src/components/ui/button';
import { Slider } from '@client/src/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@client/src/components/ui/popover';
import { Calendar as CalendarComponent } from '@client/src/components/ui/calendar';
import { useFoodMapStore } from '@client/src/store/food-map-store';
import { useTags } from '@client/src/api/tags';

interface FilterPanelProps {
  open: boolean;
  onClose: () => void;
}

export function FilterPanel({ open, onClose }: FilterPanelProps) {
  const { filter, setFilter, resetFilter } = useFoodMapStore();
  const { data: tags = [] } = useTags();
  const [datePickerOpen, setDatePickerOpen] = useState<'start' | 'end' | null>(
    null,
  );

  const handleRatingChange = (value: number[]) => {
    setFilter({ minRating: value[0] });
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    setFilter({ startDate: date ? format(date, 'yyyy-MM-dd') : null });
    setDatePickerOpen(null);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setFilter({ endDate: date ? format(date, 'yyyy-MM-dd') : null });
    setDatePickerOpen(null);
  };

  const toggleTag = (tagId: string) => {
    const newTagIds = filter.tagIds.includes(tagId)
      ? filter.tagIds.filter((id: string) => id !== tagId)
      : [...filter.tagIds, tagId];
    setFilter({ tagIds: newTagIds });
  };

  const handleReset = () => {
    resetFilter();
  };

  return (
    <>
      {/* 面板 */}
      <aside
        className={cn(
          'fixed left-0 top-14 z-40 flex h-[calc(100vh-56px)] w-[280px] flex-col border-4 border-black bg-[#FFDE00] shadow-[8px_8px_0_0_#000] transition-all duration-300 ease-in-out max-sm:inset-x-0 max-sm:top-0 max-sm:h-full max-sm:w-full max-sm:rounded-none max-sm:z-50',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between border-b-4 border-black px-4 py-3">
          <h3 className="pop-font text-lg uppercase tracking-tight text-black">筛选条件</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg border-2 border-black bg-[#FF3B30] text-white shadow-[2px_2px_0_0_#000] hover:bg-[#FF3B30]"
            aria-label="关闭"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* 内容 */}
        <div className="flex-1 space-y-6 overflow-y-auto p-4 no-scrollbar">
          {/* 评分范围 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-black uppercase text-black">
              <Star className="h-4 w-4 text-black" />
              <span>最低评分</span>
              <span className="ml-auto rounded-md border-2 border-black bg-white px-2 py-0.5 font-black text-black">
                {filter.minRating} 星
              </span>
            </div>
            <Slider
              value={[filter.minRating]}
              min={1}
              max={5}
              step={1}
              onValueChange={handleRatingChange}
              className="py-2"
            />
            <div className="flex justify-between text-xs font-bold uppercase text-black">
              <span>1 星</span>
              <span>5 星</span>
            </div>
          </div>

          {/* 时间范围 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-black uppercase text-black">
              <Calendar className="h-4 w-4 text-black" />
              <span>时间范围</span>
            </div>
            <div className="space-y-2">
              <Popover
                open={datePickerOpen === 'start'}
                onOpenChange={(openState) =>
                  setDatePickerOpen(openState ? 'start' : null)
                }
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 w-full justify-start rounded-lg border-4 border-black bg-white text-left text-sm font-bold uppercase text-black shadow-[3px_3px_0_0_#000] hover:bg-white"
                  >
                    <span className="font-black">开始：</span>
                    <span className={cn(!filter.startDate && 'text-black/40')}>
                      {filter.startDate || '选择日期'}
                    </span>
                    <ChevronDown className="ml-auto h-3.5 w-3.5 text-black" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={
                      filter.startDate ? new Date(filter.startDate) : undefined
                    }
                    onSelect={handleStartDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover
                open={datePickerOpen === 'end'}
                onOpenChange={(openState) =>
                  setDatePickerOpen(openState ? 'end' : null)
                }
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 w-full justify-start rounded-lg border-4 border-black bg-white text-left text-sm font-bold uppercase text-black shadow-[3px_3px_0_0_#000] hover:bg-white"
                  >
                    <span className="font-black">结束：</span>
                    <span className={cn(!filter.endDate && 'text-black/40')}>
                      {filter.endDate || '选择日期'}
                    </span>
                    <ChevronDown className="ml-auto h-3.5 w-3.5 text-black" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={
                      filter.endDate ? new Date(filter.endDate) : undefined
                    }
                    onSelect={handleEndDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* 标签多选 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-black uppercase text-black">
              <Tag className="h-4 w-4 text-black" />
              <span>标签筛选</span>
              {filter.tagIds.length > 0 && (
                <span className="ml-auto rounded-md border-2 border-black bg-white px-2 py-0.5 text-xs font-black text-black">
                  {filter.tagIds.length} 个
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.length === 0 ? (
                <p className="text-xs font-bold uppercase text-black/60">暂无标签</p>
              ) : (
                tags.map((tag) => {
                  const isActive = filter.tagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={cn(
                        'rounded-lg border-2 border-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0_0_#000] transition-all',
                        isActive
                          ? 'bg-[#007AFF] text-white'
                          : 'bg-white text-black hover:bg-[#FFDE00]',
                      )}
                    >
                      {tag.name}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 底部：清除全部筛选（上移避免与高德 GS 备案号重叠） */}
        <div className="border-t-4 border-black px-3 pt-3 pb-10">
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full rounded-lg border-4 border-black bg-[#FF3B30] text-sm font-black uppercase text-white shadow-[3px_3px_0_0_#000] hover:bg-[#FF3B30] hover:text-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]"
            size="sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            清除全部筛选
          </Button>
        </div>
      </aside>
    </>
  );
}

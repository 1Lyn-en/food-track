import { ChevronLeft, ChevronRight, ChevronDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FoodEntryCard } from '@client/src/components/food-map/FoodEntryCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import { useFoodMapStore } from '@client/src/store/food-map-store';
import type { FoodEntryListItem } from '@shared/api.interface';

interface SidebarProps {
  entries: FoodEntryListItem[];
  onSelect: (id: string) => void;
  selectedId?: string;
}

export function Sidebar({ entries, onSelect, selectedId }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar, filter, setFilter } =
    useFoodMapStore();

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [
      'visitDate' | 'rating',
      'asc' | 'desc',
    ];
    setFilter({ sortBy, sortOrder });
  };

  const sortValue = `${filter.sortBy}-${filter.sortOrder}`;

  return (
    <>
      {/* 折叠按钮（桌面端贴边） */}
      <button
        type="button"
        onClick={toggleSidebar}
        className={cn(
          'fixed top-1/2 z-30 flex h-14 w-7 -translate-y-1/2 items-center justify-center rounded-l-xl border-4 border-r-0 border-black bg-[#FFDE00] text-black shadow-[-3px_3px_0_0_#000] transition-all duration-300 hover:bg-white max-sm:!hidden',
          sidebarCollapsed ? 'right-0' : 'right-[360px]',
        )}
        aria-label={sidebarCollapsed ? '展开列表' : '收起列表'}
      >
        {sidebarCollapsed ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {/* 桌面端侧栏面板 */}
      <aside
        className={cn(
          'fixed right-0 top-16 z-20 flex h-[calc(100vh-64px)] flex-col border-l-4 border-black bg-[#FFF9C4] transition-all duration-300 ease-in-out max-sm:!hidden',
          sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-[360px]',
        )}
      >
        <SidebarContent
          entries={entries}
          onSelect={onSelect}
          selectedId={selectedId}
          sortValue={sortValue}
          onSortChange={handleSortChange}
        />
      </aside>

      {/* 移动端底部抽屉 */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl border-t-4 border-x-4 border-black bg-[#FFF9C4] shadow-[0_-8px_0_0_#000] transition-all duration-300 ease-in-out',
          'hidden max-sm:flex',
          sidebarCollapsed
            ? 'translate-y-[calc(100%-44px)]'
            : 'translate-y-0',
        )}
        style={{ maxHeight: '60vh' }}
      >
        {/* 拖拽手柄 */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex w-full shrink-0 items-center justify-center gap-2 py-3"
          aria-label={sidebarCollapsed ? '展开列表' : '收起列表'}
        >
          <div className="h-1.5 w-10 rounded-full bg-black" />
          <ChevronDown
            className={cn(
              'h-4 w-4 text-black transition-transform',
              !sidebarCollapsed && 'rotate-180',
            )}
          />
        </button>

        <SidebarContent
          entries={entries}
          onSelect={onSelect}
          selectedId={selectedId}
          sortValue={sortValue}
          onSortChange={handleSortChange}
        />
      </div>
    </>
  );
}

function SidebarContent({
  entries,
  onSelect,
  selectedId,
  sortValue,
  onSortChange,
}: {
  entries: FoodEntryListItem[];
  onSelect: (id: string) => void;
  selectedId?: string;
  sortValue: string;
  onSortChange: (value: string) => void;
}) {
  return (
    <>
      {/* 顶部：排序 + 计数 */}
      <div className="flex items-center justify-between gap-2 border-b-4 border-black px-4 py-3 max-sm:px-3 max-sm:py-2">
        <div className="text-sm font-black uppercase tracking-widest text-black max-sm:text-xs">
          <span className="text-[#007AFF]">{entries.length}</span>
          <span> 条记录</span>
        </div>

        <Select value={sortValue} onValueChange={onSortChange}>
          <SelectTrigger size="sm" className="h-9 w-[130px] rounded-xl border-4 border-black bg-white font-black uppercase text-xs shadow-[2px_2px_0_0_#000] max-sm:h-8 max-sm:w-[120px] max-sm:border-2 max-sm:text-[10px]">
            <ArrowUpDown className="h-3.5 w-3.5 text-black max-sm:h-3 max-sm:w-3" />
            <SelectValue placeholder="排序方式" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-4 border-black shadow-[6px_6px_0_0_#000]">
            <SelectItem value="visitDate-desc">时间（最新）</SelectItem>
            <SelectItem value="visitDate-asc">时间（最早）</SelectItem>
            <SelectItem value="rating-desc">评分（高→低）</SelectItem>
            <SelectItem value="rating-asc">评分（低→高）</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-y-auto p-3 no-scrollbar max-sm:p-2">
        {entries.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="pop-font text-2xl uppercase text-black max-sm:text-xl">暂无记录</p>
            <p className="text-xs font-bold uppercase tracking-widest text-black/50">
              点击「新建」添加第一条美食记录
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-sm:gap-2">
            {entries.map((entry: FoodEntryListItem) => (
              <div
                key={entry.id}
                className={cn(
                  'rounded-2xl transition-all duration-200',
                  selectedId === entry.id &&
                    'ring-4 ring-[#007AFF] ring-offset-2 ring-offset-[#FFF9C4] max-sm:ring-3',
                )}
              >
                <FoodEntryCard
                  entry={entry}
                  onClick={() => onSelect(entry.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部 */}
      <div className="border-t-4 border-black p-3 max-sm:p-2">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-black/40">
          共 {entries.length} 条记录
        </p>
      </div>
    </>
  );
}
import { ArrowUpDown, ListOrdered } from 'lucide-react';
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

interface ListViewProps {
  entries: FoodEntryListItem[];
  onSelect: (id: string) => void;
}

export function ListView({ entries, onSelect }: ListViewProps) {
  const { filter, setFilter } = useFoodMapStore();

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [
      'visitDate' | 'rating',
      'asc' | 'desc',
    ];
    setFilter({ sortBy, sortOrder });
  };

  const sortValue = `${filter.sortBy}-${filter.sortOrder}`;

  return (
    <div className="min-h-full bg-background p-6 pt-20 no-scrollbar max-sm:pt-[130px]">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* 顶部：标题 + 排序 + 数量 */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-black bg-[#FFDE00] text-black shadow-[4px_4px_0_0_#000]">
              <ListOrdered className="h-5 w-5" />
            </div>
            <div>
              <h2 className="pop-font text-2xl uppercase tracking-tight text-foreground">全部记录</h2>
              <p className="text-sm font-bold uppercase text-foreground">
                共 <span className="font-black text-[#FF3B30]">{entries.length}</span> 条美食记录
              </p>
            </div>
          </div>

          <Select value={sortValue} onValueChange={handleSortChange}>
            <SelectTrigger className="h-10 w-[150px] rounded-xl border-4 border-black bg-card font-bold uppercase shadow-[4px_4px_0_0_#000]">
              <ArrowUpDown className="h-4 w-4 text-black" />
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visitDate-desc">时间（最新）</SelectItem>
              <SelectItem value="visitDate-asc">时间（最早）</SelectItem>
              <SelectItem value="rating-desc">评分（高→低）</SelectItem>
              <SelectItem value="rating-asc">评分（低→高）</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 卡片网格 */}
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-4 border-dashed border-black/20 bg-card py-20 text-center">
            <p className="text-base font-black uppercase text-foreground">暂无符合条件的记录</p>
            <p className="text-xs font-bold uppercase text-foreground">
              试试调整筛选条件，或添加第一条美食记录
            </p>
          </div>
        ) : (
          <div
            data-ai-section-type="card-list"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {entries.map((entry: FoodEntryListItem) => (
              <FoodEntryCard
                key={entry.id}
                entry={entry}
                onClick={() => onSelect(entry.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

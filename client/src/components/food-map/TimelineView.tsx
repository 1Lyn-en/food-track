import { useMemo } from 'react';
import { Clock, UtensilsCrossed } from 'lucide-react';
import { FoodEntryCard } from '@client/src/components/food-map/FoodEntryCard';
import type { FoodEntryListItem } from '@shared/api.interface';

interface TimelineViewProps {
  entries: FoodEntryListItem[];
  onSelect: (id: string) => void;
}

interface DayGroup {
  date: string;
  entries: FoodEntryListItem[];
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}年${month}月${day}日`;
}

function getDayOfWeek(dateStr: string): string {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[new Date(dateStr).getDay()];
}

export function TimelineView({ entries, onSelect }: TimelineViewProps) {
  const groups = useMemo<DayGroup[]>(() => {
    const map = new Map<string, FoodEntryListItem[]>();
    for (const entry of entries) {
      const dateKey = entry.visitDate.slice(0, 10);
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(entry);
    }
    return Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, list]) => ({ date, entries: list }));
  }, [entries]);

  return (
    <div className="min-h-full bg-background p-6 pt-20 no-scrollbar max-sm:pt-[130px]">
      <div className="mx-auto max-w-[800px] space-y-6">
        {/* 头部 */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-black bg-[#FFDE00] text-black shadow-[4px_4px_0_0_#000]">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="pop-font text-2xl uppercase tracking-tight text-foreground">美食时间线</h2>
            <p className="text-sm font-bold uppercase text-foreground">
              共 <span className="font-black text-[#FF3B30]">{entries.length}</span> 条记录，
              <span className="font-black text-[#007AFF]"> {groups.length}</span> 天
            </p>
          </div>
        </div>

        {/* 时间轴 */}
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-4 border-dashed border-black/20 bg-card py-20 text-center">
            <UtensilsCrossed className="h-10 w-10 text-black/40" />
            <p className="text-base font-black uppercase text-foreground">暂无记录</p>
            <p className="text-xs font-bold uppercase text-foreground">
              添加第一条美食记录，开启你的美食之旅
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* 竖线 */}
            <div className="absolute left-[71px] top-2 bottom-2 w-1 bg-black" />

            <div className="space-y-8">
              {groups.map((group) => (
                <div key={group.date} className="relative flex gap-4">
                  {/* 日期节点 */}
                  <div className="relative z-10 flex w-[60px] shrink-0 flex-col items-end pt-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-4 border-black bg-[#FFDE00] shadow-[2px_2px_0_0_#000]">
                      <div className="h-2 w-2 rounded-full bg-black" />
                    </div>
                  </div>

                  {/* 日期 + 卡片 */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-block rotate-[-1deg] rounded-lg bg-black px-3 py-1">
                        <h3 className="text-sm font-black uppercase tracking-tight text-white">
                          {formatDateLabel(group.date)}
                        </h3>
                      </div>
                      <span className="text-xs font-bold uppercase text-foreground">
                        {getDayOfWeek(group.date)}
                      </span>
                      <span className="ml-1 rounded-lg border-2 border-black bg-[#FFDE00] px-2 py-0.5 text-xs font-black uppercase text-black">
                        {group.entries.length} 条
                      </span>
                    </div>

                    <div
                      data-ai-section-type="card-list"
                      className="grid gap-3 sm:grid-cols-2"
                    >
                      {group.entries.map((entry) => (
                        <FoodEntryCard
                          key={entry.id}
                          entry={entry}
                          onClick={() => onSelect(entry.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

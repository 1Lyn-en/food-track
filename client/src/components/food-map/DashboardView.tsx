import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { UtensilsCrossed, Store, Star } from 'lucide-react';
import { useFoodEntryStatistics } from '@client/src/api/food-entries';
import { TagCloud } from './TagCloud';

const CHART_COLORS = ['#FF3B30', '#FFDE00', '#4CD964', '#007AFF', '#000000'];

export function DashboardView({ shareViewMode }: { shareViewMode?: 'my' | 'all' | 'shared' }) {
  const { data, isLoading, error } = useFoodEntryStatistics(shareViewMode);

  const tagCloudData = useMemo(() => {
    if (!data) return [];
    return data.tagDistribution.map((item) => ({
      id: item.tagId,
      name: item.tagName,
      color: CHART_COLORS[0],
      usageCount: item.count,
    }));
  }, [data]);

  const topTags = useMemo(() => {
    if (!data) return [];
    return [...data.tagDistribution]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .reverse();
  }, [data]);

  if (isLoading) return <DashboardSkeleton />;
  if (error) {
    return (
      <div className="flex min-h-full items-center justify-center pt-20 font-bold max-sm:pt-[130px] uppercase text-foreground">
        加载失败，请稍后重试
      </div>
    );
  }
  if (!data) return null;

  const hasData =
    data.totalEntries > 0 ||
    data.ratingDistribution.length > 0 ||
    data.tagDistribution.length > 0 ||
    data.monthlyTrend.length > 0;

  if (!hasData) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center pt-20 pb-12 max-sm:pt-[130px] text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-black bg-[#FFDE00] shadow-[8px_8px_0_0_#000]">
          <UtensilsCrossed className="h-12 w-12 text-black" />
        </div>
        <h3 className="pop-font text-2xl uppercase tracking-tight text-foreground">暂无数据</h3>
        <p className="mt-2 text-sm font-bold uppercase text-foreground">
          添加第一条美食记录，开始你的食迹吧
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 pt-20 no-scrollbar max-sm:pt-[130px]">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* KPI 卡片 */}
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-3"
          data-ai-section-type="card-stat"
        >
          <KpiCard
            icon={UtensilsCrossed}
            label="总记录数"
            value={data.totalEntries}
          />
          <KpiCard
            icon={Store}
            label="覆盖餐厅"
            value={data.totalRestaurants}
          />
          <KpiCard
            icon={Star}
            label="平均评分"
            value={data.averageRating.toFixed(1)}
            suffix="分"
          />
        </div>

        {/* 图表区 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 评分分布饼图 */}
          <ChartCard title="评分分布">
            {data.ratingDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data.ratingDistribution.map((item) => ({
                      name: `${item.rating} 星`,
                      value: item.count,
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.ratingDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '0.75rem',
                      border: '2px solid #000',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '0.8rem' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartHint />
            )}
          </ChartCard>

          {/* 标签分布柱状图 */}
          <ChartCard title="标签 TOP 10">
            {topTags.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topTags} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="tagName"
                    tick={{ fontSize: 11 }}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '0.75rem',
                      border: '2px solid #000',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                    }}
                    formatter={(value: number) => [`${value} 条`, '记录数']}
                  />
                  <Bar dataKey="count" fill="#FF3B30" stroke="#000" strokeWidth={2} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartHint />
            )}
          </ChartCard>

          {/* 月度趋势折线图 */}
          <ChartCard title="月度记录趋势">
            {data.monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.monthlyTrend} margin={{ left: -10 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#000"
                    strokeOpacity={0.15}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: string) => v.slice(5)}
                  />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '0.75rem',
                      border: '2px solid #000',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#007AFF"
                    strokeWidth={4}
                    dot={{ fill: '#007AFF', stroke: '#000', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#000', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartHint />
            )}
          </ChartCard>
        </div>

        {/* 标签云 */}
        <div className="rounded-2xl border-4 border-black bg-card p-6 shadow-[8px_8px_0_0_#000]">
          <div className="mb-4 inline-block rotate-[-1deg] rounded-lg bg-black px-3 py-1">
            <h3 className="pop-font text-lg uppercase tracking-tight text-white">标签云</h3>
          </div>
          <TagCloud tags={tagCloudData} />
        </div>
      </div>
    </div>
  );
}

interface KpiCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  suffix?: string;
}

function KpiCard({ icon: Icon, label, value, suffix }: KpiCardProps) {
  return (
    <div className="rounded-2xl border-4 border-black bg-card p-6 shadow-[8px_8px_0_0_#000]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-foreground">{label}</p>
          <p className="mt-2 text-5xl font-black text-foreground drop-shadow-[2px_2px_0_#000]">
            {value}
            {suffix && (
              <span className="ml-1 text-base font-bold uppercase text-foreground">
                {suffix}
              </span>
            )}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-black bg-[#FFDE00] text-black shadow-[4px_4px_0_0_#000]">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border-4 border-black bg-card p-5 shadow-[8px_8px_0_0_#000]">
      <div className="mb-3 inline-block rotate-[-1deg] rounded-lg bg-[#FF3B30] px-3 py-1">
        <h3 className="pop-font text-base uppercase tracking-tight text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function EmptyChartHint() {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm font-bold uppercase text-foreground">
      暂无数据
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-full p-6 pt-20 no-scrollbar max-sm:pt-[130px]">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border-4 border-black bg-black/10"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[300px] animate-pulse rounded-2xl border-4 border-black bg-black/10"
            />
          ))}
        </div>
        <div className="h-40 animate-pulse rounded-2xl border-4 border-black bg-black/10" />
      </div>
    </div>
  );
}

export default DashboardView;

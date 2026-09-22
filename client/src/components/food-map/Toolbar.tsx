import { useRef, useState } from 'react';
import {
  Map,
  List,
  Clock,
  BarChart3,
  Plus,
  Search,
  MoreHorizontal,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  UtensilsCrossed,
  Users,
  User,
  Globe,
  Share2,
  Menu,
  X,
  Filter,
  ChevronDown,
} from 'lucide-react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@client/src/components/ui/tabs';
import { Input } from '@client/src/components/ui/input';
import { Button } from '@client/src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@client/src/components/ui/dropdown-menu';
import { useFoodMapStore } from '@client/src/store/food-map-store';
import { useKeyboardShortcuts } from '@client/src/hooks/use-keyboard-shortcuts';
import { CollabPanel } from './CollabPanel';
import { UserMenu } from './UserMenu';
import type { ViewMode, ShareViewMode } from '@shared/api.interface';

const VIEW_TABS: { value: ViewMode; label: string; icon: React.ElementType }[] = [
  { value: 'map', label: '地图', icon: Map },
  { value: 'list', label: '列表', icon: List },
  { value: 'timeline', label: '时间线', icon: Clock },
  { value: 'dashboard', label: '统计', icon: BarChart3 },
];

const SHARE_TABS: { value: ShareViewMode; label: string; icon: React.ElementType }[] = [
  { value: 'my', label: '我的', icon: User },
  { value: 'all', label: '全部', icon: Globe },
  { value: 'shared', label: '共享', icon: Share2 },
];

export function Toolbar() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [collabOpen, setCollabOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandPanel, setExpandPanel] = useState(false);
  const {
    viewMode,
    setViewMode,
    shareViewMode,
    setShareViewMode,
    filter,
    setFilter,
    openCreateForm,
    toggleFilterPanel,
    setDataManageOpen,
  } = useFoodMapStore();

  useKeyboardShortcuts({
    onNewEntry: () => {
      openCreateForm();
    },
    onFocusSearch: () => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    },
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({ keyword: e.target.value });
  };

  const handleViewChange = (value: string) => {
    setViewMode(value as ViewMode);
  };

  const handleExport = () => {
    setDataManageOpen(true, 'export');
    setMobileMenuOpen(false);
  };

  const handleImport = () => {
    setDataManageOpen(true, 'import');
    setMobileMenuOpen(false);
  };

  const handleBatchDelete = () => {
    setDataManageOpen(true, 'batch-delete');
    setMobileMenuOpen(false);
  };

  const handleClearAll = () => {
    setDataManageOpen(true, 'clear');
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* ===== 桌面端工具栏 ===== */}
      <header
        className="fixed inset-x-0 top-0 z-40 hidden h-16 items-center border-b-4 border-black bg-[#FFDE00] px-4 sm:flex"
        data-ai-section-type="button"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-4 border-black bg-[#FF3B30] text-white shadow-[3px_3px_0_0_#000]">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <h1 className="pop-font text-3xl uppercase tracking-tight text-black">
            食迹
          </h1>
        </div>

        <div className="flex flex-1 items-center justify-center gap-3">
          <Tabs
            value={shareViewMode}
            onValueChange={(v) => setShareViewMode(v as ShareViewMode)}
            className="w-auto"
          >
            <TabsList className="h-11 gap-1 rounded-xl border-4 border-black bg-white p-1 shadow-[3px_3px_0_0_#000]">
              {SHARE_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="h-8 gap-1.5 rounded-lg px-3 text-xs font-black uppercase tracking-widest text-black data-[state=active]:bg-[#007AFF] data-[state=active]:text-white data-[state=active]:shadow-none"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          <Tabs
            value={viewMode}
            onValueChange={handleViewChange}
            className="w-auto"
          >
            <TabsList className="h-11 gap-1 rounded-xl border-4 border-black bg-white p-1 shadow-[3px_3px_0_0_#000]">
              {VIEW_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="h-8 gap-1.5 rounded-lg px-4 text-xs font-black uppercase tracking-widest text-black data-[state=active]:bg-[#007AFF] data-[state=active]:text-white data-[state=active]:shadow-none"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black" />
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="搜索菜品、餐厅、地址…"
              value={filter.keyword}
              onChange={handleSearchChange}
              className="h-10 w-full rounded-xl border-4 border-black bg-white pl-9 pr-16 text-sm font-bold placeholder:text-black/40 focus-visible:ring-0"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border-2 border-black bg-[#FFDE00] px-1.5 py-0.5 text-[10px] font-black text-black">
              /
            </kbd>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFilterPanel}
            className="rounded-xl border-4 border-black bg-white shadow-[3px_3px_0_0_#000] hover:bg-[#FFDE00] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]"
            aria-label="筛选"
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollabOpen(true)}
            className="rounded-xl border-4 border-black bg-white shadow-[3px_3px_0_0_#000] hover:bg-[#FFDE00] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]"
            aria-label="协作"
          >
            <Users className="h-4 w-4" />
          </Button>

          <Button
            onClick={openCreateForm}
            className="gap-1.5 rounded-xl border-4 border-black bg-[#4CD964] font-black uppercase tracking-widest text-black shadow-[3px_3px_0_0_#000] hover:bg-[#4CD964] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">新建</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl border-4 border-black bg-white shadow-[3px_3px_0_0_#000] hover:bg-[#FFDE00] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]"
                aria-label="更多操作"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl border-4 border-black shadow-[6px_6px_0_0_#000]">
              <DropdownMenuLabel className="font-black uppercase tracking-widest">数据管理</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExport}>
                <Download className="h-4 w-4" />
                导出数据
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleImport}>
                <Upload className="h-4 w-4" />
                导入数据
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleBatchDelete}>
                <Trash2 className="h-4 w-4" />
                批量删除
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleClearAll}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <AlertTriangle className="h-4 w-4" />
                清空数据
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <UserMenu />
        </div>
      </header>

      {/* ===== 移动端工具栏 ===== */}
      <header
        className="fixed inset-x-0 top-0 z-40 flex flex-wrap border-b-4 border-black bg-[#FFDE00] px-2 py-1.5 sm:hidden"
        data-ai-section-type="button"
      >
        {/* 主行：Logo + 操作按钮 */}
        <div className="flex w-full items-center gap-1">
          <div className="flex items-center gap-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-[#FF3B30] text-white shadow-[2px_2px_0_0_#000]">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
            <h1 className="pop-font text-xl uppercase tracking-tight text-black">
              食迹
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFilterPanel}
              className="h-8 w-8 rounded-lg border-2 border-black bg-white shadow-[2px_2px_0_0_#000] hover:bg-[#FFDE00] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000]"
              aria-label="筛选"
            >
              <Filter className="h-4 w-4" />
            </Button>

            <Button
              onClick={openCreateForm}
              className="h-8 w-8 rounded-lg border-2 border-black bg-[#4CD964] p-0 font-black uppercase tracking-widest text-black shadow-[2px_2px_0_0_#000] hover:bg-[#4CD964] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000]"
            >
              <Plus className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="h-8 w-8 rounded-lg border-2 border-black bg-white shadow-[2px_2px_0_0_#000] hover:bg-[#FFDE00] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000]"
              aria-label="菜单"
            >
              <Menu className="h-4 w-4" />
            </Button>

            <UserMenu />
          </div>
        </div>

        {/* 视图切换行（始终可见） */}
        <div className="mt-1.5 flex w-full justify-center">
          <Tabs
            value={viewMode}
            onValueChange={handleViewChange}
            className="w-auto"
          >
            <TabsList className="h-9 gap-0.5 rounded-lg border-2 border-black bg-white p-0.5 shadow-[2px_2px_0_0_#000]">
              {VIEW_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="h-7 gap-1 rounded-md px-2 text-[10px] font-black uppercase tracking-widest text-black data-[state=active]:bg-[#007AFF] data-[state=active]:text-white"
                  >
                    <Icon className="h-3 w-3" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* 下拉手柄 */}
        <button
          type="button"
          onClick={() => setExpandPanel((v) => !v)}
          className="flex w-full items-center justify-center gap-2 py-1.5"
          aria-label={expandPanel ? '收起搜索' : '展开搜索'}
        >
          <div className="h-1 w-8 rounded-full bg-black/40" />
          <ChevronDown
            className={`h-3.5 w-3.5 text-black/50 transition-transform duration-200 ${expandPanel ? 'rotate-180' : ''}`}
          />
        </button>

        {/* 可展开面板 */}
        <div
          className={`w-full overflow-hidden transition-all duration-300 ${
            expandPanel ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-2 pb-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black" />
              <Input
                type="search"
                placeholder="搜索菜品、餐厅、地址…"
                value={filter.keyword}
                onChange={handleSearchChange}
                data-search-input
                className="h-9 w-full rounded-lg border-2 border-black bg-white pl-8 pr-3 text-sm font-bold placeholder:text-black/40 focus-visible:ring-0"
              />
            </div>

            <Tabs
              value={shareViewMode}
              onValueChange={(v) => setShareViewMode(v as ShareViewMode)}
              className="w-auto"
            >
              <TabsList className="h-9 gap-0.5 rounded-lg border-2 border-black bg-white p-0.5 shadow-[2px_2px_0_0_#000]">
                {SHARE_TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="h-7 gap-1 rounded-md px-2 text-[10px] font-black uppercase tracking-widest text-black data-[state=active]:bg-[#007AFF] data-[state=active]:text-white"
                    >
                      <Icon className="h-3 w-3" />
                      {tab.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      {/* 移动端菜单面板 */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 sm:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t-4 border-x-4 border-black bg-[#FFF9C4] p-4 shadow-[0_-8px_0_0_#000] sm:hidden">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="pop-font text-lg uppercase tracking-tight text-black">
                更多操作
              </h3>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-[#FF3B30] text-white shadow-[2px_2px_0_0_#000]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => { setCollabOpen(true); setMobileMenuOpen(false); }}
                className="flex w-full items-center gap-3 rounded-xl border-3 border-black bg-white p-3 text-sm font-black uppercase text-black shadow-[3px_3px_0_0_#000] hover:bg-[#FFDE00]"
              >
                <Users className="h-4 w-4" />
                协作组
              </button>

              <button
                type="button"
                onClick={handleExport}
                className="flex w-full items-center gap-3 rounded-xl border-3 border-black bg-white p-3 text-sm font-black uppercase text-black shadow-[3px_3px_0_0_#000] hover:bg-[#FFDE00]"
              >
                <Download className="h-4 w-4" />
                导出数据
              </button>

              <button
                type="button"
                onClick={handleImport}
                className="flex w-full items-center gap-3 rounded-xl border-3 border-black bg-white p-3 text-sm font-black uppercase text-black shadow-[3px_3px_0_0_#000] hover:bg-[#FFDE00]"
              >
                <Upload className="h-4 w-4" />
                导入数据
              </button>

              <button
                type="button"
                onClick={handleBatchDelete}
                className="flex w-full items-center gap-3 rounded-xl border-3 border-black bg-white p-3 text-sm font-black uppercase text-black shadow-[3px_3px_0_0_#000] hover:bg-[#FFDE00]"
              >
                <Trash2 className="h-4 w-4" />
                批量删除
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="flex w-full items-center gap-3 rounded-xl border-3 border-black bg-[#FF3B30] p-3 text-sm font-black uppercase text-white shadow-[3px_3px_0_0_#000]"
              >
                <AlertTriangle className="h-4 w-4" />
                清空数据
              </button>
            </div>
          </div>
        </>
      )}

      <CollabPanel open={collabOpen} onClose={() => setCollabOpen(false)} />
    </>
  );
}
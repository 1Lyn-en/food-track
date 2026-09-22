import { lazy, Suspense, useState, useRef, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useFoodMapStore } from '@client/src/store/food-map-store';
import {
  useFoodEntries,
  useFoodEntryMarkers,
  useDeleteFoodEntry,
  useCreateFoodEntry,
  useUpdateFoodEntry,
} from '@client/src/api/food-entries';
import { useKeyboardShortcuts } from '@client/src/hooks/use-keyboard-shortcuts';
import { Toolbar } from '@client/src/components/food-map/Toolbar';
import { FilterPanel } from '@client/src/components/food-map/FilterPanel';
import { Sidebar } from '@client/src/components/food-map/Sidebar';
import AmapView from '@client/src/components/food-map/AmapView';
import { ListView } from '@client/src/components/food-map/ListView';
import { TimelineView } from '@client/src/components/food-map/TimelineView';
import { FoodEntryForm } from '@client/src/components/food-map/FoodEntryForm';
import DetailDrawer from '@client/src/components/food-map/DetailDrawer';
import { ErrorBoundary } from '@client/src/components/food-map/ErrorBoundary';
import type {
  CreateFoodEntryRequest,
  UpdateFoodEntryRequest,
  FoodEntryMapMarker,
} from '@shared/api.interface';
import { useUserInfo, useCreateUserInfo } from '@client/src/api/user-info';
import { NicknameDialog } from '@client/src/components/food-map/NicknameDialog';
import { ProfileSetupDialog } from '@client/src/components/food-map/ProfileSetupDialog';
import { ProfilePanel } from '@client/src/components/food-map/ProfilePanel';
import { useCurrentUserProfile } from '@lark-apaas/client-toolkit/hooks/useCurrentUserProfile';
import { logger } from '@lark-apaas/client-toolkit/logger';

const DashboardView = lazy(
  () => import('@client/src/components/food-map/DashboardView'),
);
const DataManageDialog = lazy(() =>
  import('@client/src/components/food-map/DataManageDialog').then((module) => ({
    default: module.DataManageDialog,
  })),
);

export default function FoodMapPage() {
  const {
    viewMode,
    shareViewMode,
    filter,
    selectedEntryId,
    setSelectedEntryId,
    isFormDialogOpen,
    closeFormDialog,
    editingEntry,
    openCreateForm,
    openEditForm,
    isDetailDrawerOpen,
    openDetailDrawer,
    closeDetailDrawer,
    isDataManageOpen,
    setDataManageOpen,
    pendingLocation,
    setPendingLocation,
    previewEntryId,
    setPreviewEntryId,
    filterPanelCollapsed,
    toggleFilterPanel,
  } = useFoodMapStore();

  const mapRef = useRef<any>(null);
  const [showPreviewDeleteConfirm, setShowPreviewDeleteConfirm] =
    useState(false);

  const { data: userInfo, isLoading: userInfoLoading } = useUserInfo();
  const currentUser = useCurrentUserProfile();
  const currentUserId = currentUser?.user_id || null;
  const createUserInfo = useCreateUserInfo();

  const [nicknameDialogOpen, setNicknameDialogOpen] = useState(false);

  useEffect(() => {
    if (!userInfoLoading && !userInfo) {
      setNicknameDialogOpen(true);
    }
  }, [userInfoLoading, userInfo]);

  const handleProfileSetup = async (
    nickname: string,
    avatarUrl: string | null,
  ) => {
    try {
      await createUserInfo.mutateAsync({ nickname, avatar: avatarUrl });
    } catch (err: any) {
      logger.error('创建用户信息失败', err);
      throw err;
    }
  };

  const { data: listData } = useFoodEntries({
    page: 1,
    pageSize: 50,
    keyword: filter.keyword,
    minRating: filter.minRating,
    startDate: filter.startDate || undefined,
    endDate: filter.endDate || undefined,
    tagIds: filter.tagIds.length > 0 ? filter.tagIds : undefined,
    sortBy: filter.sortBy,
    sortOrder: filter.sortOrder,
    shareViewMode,
  });

  const { data: markers } = useFoodEntryMarkers(shareViewMode);
  const deleteMutation = useDeleteFoodEntry();
  const createMutation = useCreateFoodEntry();
  const updateMutation = useUpdateFoodEntry();

  const entries = listData?.items || [];

  useKeyboardShortcuts({
    onNewEntry: () => {
      openCreateForm();
    },
    onFocusSearch: () => {
      const input = document.querySelector<HTMLInputElement>(
        '[data-search-input]',
      );
      input?.focus();
    },
    onEscape: () => {
      if (isFormDialogOpen) closeFormDialog();
      if (isDetailDrawerOpen) closeDetailDrawer();
      if (isDataManageOpen) setDataManageOpen(false);
    },
  });

  const currentIndex = useMemo(() => {
    if (!selectedEntryId) return -1;
    return entries.findIndex((e) => e.id === selectedEntryId);
  }, [selectedEntryId, entries]);

  const previewEntry = useMemo(() => {
    if (!previewEntryId) return null;
    return entries.find((e) => e.id === previewEntryId) ?? null;
  }, [previewEntryId, entries]);

  const handleSelectEntry = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;

    // 地图视图：两段式交互——首次居中并弹预览卡，再次点同一店铺打开详情抽屉
    if (viewMode === 'map') {
      if (previewEntryId === id) {
        openDetailDrawer(id);
        return;
      }
      setPreviewEntryId(id);
      setSelectedEntryId(id);
      if (mapRef.current) {
        mapRef.current.panTo?.(entry.longitude, entry.latitude);
      }
      return;
    }

    // 其它视图：保持打开详情抽屉
    openDetailDrawer(id);
  };

  const handleMapClick = () => {
    // 点击地图空白处仅关闭预览卡片，不再弹出新建表单
    if (previewEntryId) {
      setPreviewEntryId(null);
    }
  };

  const handleMarkerClick = (marker: FoodEntryMapMarker) => {
    const entry = entries.find((e) => e.id === marker.id);
    if (previewEntryId === marker.id) {
      openDetailDrawer(marker.id);
      return;
    }
    setPreviewEntryId(marker.id);
    setSelectedEntryId(marker.id);
    if (mapRef.current && entry) {
      mapRef.current.panTo?.(entry.longitude, entry.latitude);
    }
  };

  const handleFormSubmit = async (data: CreateFoodEntryRequest) => {
    try {
      if (editingEntry) {
        await updateMutation.mutateAsync({
          id: editingEntry.id,
          data: data as UpdateFoodEntryRequest,
        });
        toast.success('记录更新成功');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('记录创建成功');
      }
      closeFormDialog();
      setPendingLocation(null);
    } catch (err: any) {
      logger.error('提交失败', err);
      toast.error(err?.message || '操作失败');
      throw err;
    }
  };

  const handleEdit = () => {
    const entry = entries.find((e) => e.id === selectedEntryId);
    if (entry) {
      openEditForm(entry as any);
      closeDetailDrawer();
    }
  };

  const handleDelete = async () => {
    if (!selectedEntryId) return;
    try {
      await deleteMutation.mutateAsync(selectedEntryId);
      toast.success('删除成功');
      closeDetailDrawer();
      setSelectedEntryId(null);
    } catch (err: any) {
      logger.error('删除失败', err);
      toast.error(err?.message || '删除失败');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      openDetailDrawer(entries[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < entries.length - 1) {
      openDetailDrawer(entries[currentIndex + 1].id);
    }
  };

  const handlePreviewEdit = () => {
    if (!previewEntry) return;
    openEditForm(previewEntry as any);
    setPreviewEntryId(null);
  };

  const handlePreviewDelete = async () => {
    if (!previewEntryId) return;
    try {
      await deleteMutation.mutateAsync(previewEntryId);
      toast.success('删除成功');
      setShowPreviewDeleteConfirm(false);
      setPreviewEntryId(null);
      setSelectedEntryId(null);
    } catch (err: any) {
      logger.error('删除失败', err);
      toast.error(err?.message || '删除失败');
    }
  };

  const handlePreviewClose = () => {
    setPreviewEntryId(null);
    setShowPreviewDeleteConfirm(false);
  };

  const handleFormClose = () => {
    closeFormDialog();
    setPendingLocation(null);
  };

  return (
    <ErrorBoundary>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#FFDE00] halftone-bg">
        <Toolbar />

        <div className="flex-1 flex relative overflow-hidden">
          {viewMode === 'map' && (
            <>
              <FilterPanel
                open={!filterPanelCollapsed}
                onClose={toggleFilterPanel}
              />
              <main className="flex-1 relative">
                <AmapView
                  ref={mapRef}
                  markers={markers || []}
                  currentUserId={currentUserId}
                  onMarkerClick={handleMarkerClick}
                  onMapClick={handleMapClick}
                  previewEntry={isFormDialogOpen ? null : previewEntry}
                  onPreviewEdit={handlePreviewEdit}
                  onPreviewDelete={() => setShowPreviewDeleteConfirm(true)}
                  onPreviewClose={handlePreviewClose}
                />
              </main>
              <Sidebar
                entries={entries}
                onSelect={handleSelectEntry}
                selectedId={selectedEntryId || undefined}
              />
            </>
          )}

          {viewMode === 'list' && (
            <main className="flex-1 overflow-auto pop-scrollbar">
              <ListView entries={entries} onSelect={handleSelectEntry} />
            </main>
          )}

          {viewMode === 'timeline' && (
            <main className="flex-1 overflow-auto pop-scrollbar">
              <TimelineView entries={entries} onSelect={handleSelectEntry} />
            </main>
          )}

          {viewMode === 'dashboard' && (
            <main className="flex-1 overflow-auto pop-scrollbar">
              <Suspense fallback={null}>
                <DashboardView shareViewMode={shareViewMode} />
              </Suspense>
            </main>
          )}
        </div>

        <FoodEntryForm
          open={isFormDialogOpen}
          onClose={handleFormClose}
          initialData={editingEntry}
          onSubmit={handleFormSubmit}
        />

        <DetailDrawer
          open={isDetailDrawerOpen}
          onClose={closeDetailDrawer}
          entryId={selectedEntryId}
          onPrev={handlePrev}
          onNext={handleNext}
          onEdit={handleEdit}
          onDelete={handleDelete}
          hasPrev={currentIndex > 0}
          hasNext={currentIndex >= 0 && currentIndex < entries.length - 1}
        />

        {isDataManageOpen && (
          <Suspense fallback={null}>
            <DataManageDialog open onClose={() => setDataManageOpen(false)} />
          </Suspense>
        )}

        <ProfileSetupDialog
          open={nicknameDialogOpen && !userInfoLoading && !userInfo}
          onSave={handleProfileSetup}
        />

        <ProfilePanel />

        {showPreviewDeleteConfirm && previewEntry && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setShowPreviewDeleteConfirm(false)}
          >
            <div
              className="mx-6 w-full max-w-sm rounded-2xl border-4 border-black bg-card p-6 shadow-[8px_8px_0_0_#000]"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-black uppercase tracking-tight text-foreground">
                确认删除
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                删除后无法恢复，确定要删除「{previewEntry.dishName}」吗？
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPreviewDeleteConfirm(false)}
                  className="rounded-xl border-4 border-black bg-white px-4 py-2 text-sm font-black uppercase text-black shadow-[4px_4px_0_0_#000] transition-colors hover:bg-[#FFDE00] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000]"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handlePreviewDelete}
                  className="rounded-xl border-4 border-black bg-[#FF3B30] px-4 py-2 text-sm font-black uppercase text-white shadow-[4px_4px_0_0_#000] transition-colors active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000]"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

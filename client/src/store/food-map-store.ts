import { create } from 'zustand';
import type { ViewMode, FilterState, FoodEntry, ShareViewMode } from '@shared/api.interface';

interface FoodMapState {
  viewMode: ViewMode;
  filter: FilterState;
  selectedEntryId: string | null;
  isDetailDrawerOpen: boolean;
  isFormDialogOpen: boolean;
  editingEntry: FoodEntry | null;
  sidebarCollapsed: boolean;
  filterPanelCollapsed: boolean;
  isDataManageOpen: boolean;
  dataManageTab: string;
  pendingLocation: { lng: number; lat: number } | null;
  previewEntryId: string | null;
  shareViewMode: ShareViewMode;
  isProfilePanelOpen: boolean;

  setViewMode: (mode: ViewMode) => void;
  setShareViewMode: (mode: ShareViewMode) => void;
  setProfilePanelOpen: (open: boolean) => void;
  setFilter: (filter: Partial<FilterState>) => void;
  resetFilter: () => void;
  setSelectedEntryId: (id: string | null) => void;
  openDetailDrawer: (id: string) => void;
  closeDetailDrawer: () => void;
  openCreateForm: () => void;
  openEditForm: (entry: FoodEntry) => void;
  closeFormDialog: () => void;
  toggleSidebar: () => void;
  toggleFilterPanel: () => void;
  setDataManageOpen: (open: boolean, tab?: string) => void;
  setDataManageTab: (tab: string) => void;
  setPendingLocation: (loc: { lng: number; lat: number } | null) => void;
  setPreviewEntryId: (id: string | null) => void;
}

const defaultFilter: FilterState = {
  keyword: '',
  minRating: 1,
  startDate: null,
  endDate: null,
  tagIds: [],
  sortBy: 'visitDate',
  sortOrder: 'desc',
};

export const useFoodMapStore = create<FoodMapState>((set) => ({
  viewMode: 'map',
  filter: defaultFilter,
  selectedEntryId: null,
  isDetailDrawerOpen: false,
  isFormDialogOpen: false,
  editingEntry: null,
  sidebarCollapsed: false,
  filterPanelCollapsed: false,
  isDataManageOpen: false,
  dataManageTab: 'export',
  pendingLocation: null,
  previewEntryId: null,
  shareViewMode: 'all',

  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),

  setShareViewMode: (mode: ShareViewMode) => set({ shareViewMode: mode }),

  isProfilePanelOpen: false,
  setProfilePanelOpen: (open: boolean) => set({ isProfilePanelOpen: open }),

  setFilter: (patch: Partial<FilterState>) =>
    set((state) => ({ filter: { ...state.filter, ...patch } })),

  resetFilter: () => set({ filter: defaultFilter }),

  setSelectedEntryId: (id: string | null) => set({ selectedEntryId: id }),

  openDetailDrawer: (id: string) =>
    set({ selectedEntryId: id, isDetailDrawerOpen: true }),

  closeDetailDrawer: () => set({ isDetailDrawerOpen: false }),

  openCreateForm: () => set({ isFormDialogOpen: true, editingEntry: null }),

  openEditForm: (entry: FoodEntry) =>
    set({ isFormDialogOpen: true, editingEntry: entry }),

  closeFormDialog: () => set({ isFormDialogOpen: false, editingEntry: null }),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  toggleFilterPanel: () =>
    set((state) => ({ filterPanelCollapsed: !state.filterPanelCollapsed })),

  setDataManageOpen: (open: boolean, tab?: string) =>
    set(tab ? { isDataManageOpen: open, dataManageTab: tab } : { isDataManageOpen: open }),

  setDataManageTab: (tab: string) => set({ dataManageTab: tab }),

  setPendingLocation: (loc: { lng: number; lat: number } | null) =>
    set({ pendingLocation: loc }),

  setPreviewEntryId: (id: string | null) => set({ previewEntryId: id }),
}));

export interface Tag {
  id: string;
  name: string;
  color: string;
  usageCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FoodEntry {
  id: string;
  dishName: string;
  restaurantName: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  note: string;
  images: string[];
  visitDate: string;
  favorite: boolean;
  tags: Tag[];
  groupId: string | null;
  userId: string | null;
  creatorNickname: string | null;
  creatorColor: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FoodEntryListItem {
  id: string;
  dishName: string;
  restaurantName: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  images: string[];
  visitDate: string;
  favorite: boolean;
  tags: Array<{ id: string; name: string; color: string }>;
  groupId: string | null;
  userId: string | null;
  creatorNickname: string | null;
  creatorColor: string | null;
}

export interface FoodEntryMapMarker {
  id: string;
  dishName: string;
  restaurantName: string;
  latitude: number;
  longitude: number;
  rating: number;
  images: string[];
  tags: Array<{ id: string; name: string }>;
  groupId: string | null;
  userId: string | null;
  creatorNickname: string | null;
  creatorColor: string | null;
}

export interface FoodEntryListResponse {
  items: FoodEntryListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateFoodEntryRequest {
  dishName: string;
  restaurantName: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  note?: string;
  images: string[];
  visitDate: string;
  favorite?: boolean;
  tagIds: string[];
  groupId?: string | null;
}

export interface UpdateFoodEntryRequest extends CreateFoodEntryRequest {}

export interface CreateTagRequest {
  name: string;
  color?: string;
}

export interface UpdateTagRequest {
  name: string;
  color?: string;
}

export interface FoodEntryStatistics {
  totalEntries: number;
  totalRestaurants: number;
  averageRating: number;
  ratingDistribution: Array<{ rating: number; count: number }>;
  tagDistribution: Array<{ tagId: string; tagName: string; count: number }>;
  monthlyTrend: Array<{ month: string; count: number }>;
}

export interface BatchDeleteRequest {
  ids: string[];
}

export interface BatchDeleteResponse {
  success: boolean;
  deletedCount: number;
}

export interface ImportFoodEntryItem {
  dishName: string;
  restaurantName: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  note?: string;
  images?: string[];
  visitDate: string;
  favorite?: boolean;
  tagNames?: string[];
}

export interface ImportFoodEntryRequest {
  entries: ImportFoodEntryItem[];
  mode: 'merge' | 'replace';
}

export interface ImportFoodEntryResponse {
  success: boolean;
  importedCount: number;
}

export interface UserInfo {
  userId: string;
  nickname: string;
  color: string;
  avatar: string | null;
}

export interface CreateUserInfoRequest {
  nickname: string;
  avatar?: string | null;
}

export interface UpdateUserInfoRequest {
  nickname?: string;
  avatar?: string | null;
}

export interface CollabGroup {
  id: string;
  name: string;
  shareCode: string;
  createdBy: string;
  memberCount: number;
  createdAt: string;
}

export interface CollabGroupWithMembers extends CollabGroup {
  members: CollabMember[];
}

export interface CollabMember {
  userId: string;
  nickname: string | null;
  color: string | null;
}

export interface CreateCollabGroupRequest {
  name: string;
}

export interface JoinCollabGroupRequest {
  shareCode: string;
}

export interface CreateCollabGroupResponse {
  id: string;
  shareCode: string;
}

export interface CollabGroupListResponse {
  groups: CollabGroup[];
}

export type ViewMode = 'map' | 'list' | 'timeline' | 'dashboard';

export type ShareViewMode = 'my' | 'all' | 'shared';

export interface FilterState {
  keyword: string;
  minRating: number;
  startDate: string | null;
  endDate: string | null;
  tagIds: string[];
  sortBy: 'visitDate' | 'rating';
  sortOrder: 'asc' | 'desc';
}

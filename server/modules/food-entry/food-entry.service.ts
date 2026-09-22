import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, or, gte, lte, like, inArray, desc, asc, count, sql } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { foodEntry, foodEntryTag, tag, collabMember, userInfo } from '../../database/schema';
import type {
  FoodEntry,
  FoodEntryListItem,
  FoodEntryListResponse,
  CreateFoodEntryRequest,
  UpdateFoodEntryRequest,
  FoodEntryMapMarker,
  BatchDeleteResponse,
  ImportFoodEntryRequest,
  ImportFoodEntryResponse,
  FoodEntryStatistics,
} from '@shared/api.interface';

@Injectable()
export class FoodEntryService {
  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  private async getUserGroupIds(userId: string): Promise<string[]> {
    const rows = await this.db
      .select({ groupId: collabMember.groupId })
      .from(collabMember)
      .where(sql`(${collabMember.userId}).user_id = ${userId}`);
    return rows.map((r: { groupId: string }) => r.groupId);
  }

  private async assertGroupMembership(
    groupId: string | null | undefined,
    userId: string,
  ): Promise<void> {
    if (!groupId) return;

    const membership = await this.db
      .select({ groupId: collabMember.groupId })
      .from(collabMember)
      .where(
        and(
          eq(collabMember.groupId, groupId),
          sql`(${collabMember.userId}).user_id = ${userId}`,
        ),
      )
      .limit(1);

    if (membership.length === 0) {
      throw new ForbiddenException('无权使用该协作组');
    }
  }

  async findAll(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    minRating?: number;
    startDate?: string;
    endDate?: string;
    tagIds?: string[];
    sortBy?: 'visitDate' | 'rating';
    sortOrder?: 'asc' | 'desc';
    shareViewMode?: 'my' | 'all' | 'shared';
    userId: string;
  }): Promise<FoodEntryListResponse> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const sortBy = params.sortBy || 'visitDate';
    const sortOrder = params.sortOrder || 'desc';

    const groupIds = await this.getUserGroupIds(params.userId);
    const visibilityConditions: any[] = [];

    if (params.shareViewMode === 'my') {
      visibilityConditions.push(sql`(${foodEntry.userId}).user_id = ${params.userId}`);
    } else if (params.shareViewMode === 'shared') {
      if (groupIds.length > 0) {
        visibilityConditions.push(
          and(
            inArray(foodEntry.groupId, groupIds),
            sql`(${foodEntry.userId}).user_id != ${params.userId}`
          )
        );
      } else {
        visibilityConditions.push(sql`false`);
      }
    } else {
      visibilityConditions.push(sql`(${foodEntry.userId}).user_id = ${params.userId}`);
      if (groupIds.length > 0) {
        visibilityConditions.push(inArray(foodEntry.groupId, groupIds));
      }
    }

    const conditions: any[] = [or(...visibilityConditions)];
    if (params.keyword) {
      const escaped = params.keyword.replace(/%/g, '\\%').replace(/_/g, '\\_');
      const kw = `%${escaped}%`;
      conditions.push(
        sql`(${foodEntry.dishName} LIKE ${kw} OR ${foodEntry.restaurantName} LIKE ${kw} OR ${foodEntry.address} LIKE ${kw} OR ${foodEntry.note} LIKE ${kw})`
      );
    }
    if (params.minRating) {
      conditions.push(gte(foodEntry.rating, params.minRating));
    }
    if (params.startDate) {
      conditions.push(gte(foodEntry.visitDate, new Date(params.startDate)));
    }
    if (params.endDate) {
      conditions.push(lte(foodEntry.visitDate, new Date(params.endDate)));
    }

    let baseQuery: any = this.db.select().from(foodEntry);
    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions));
    }

    if (params.tagIds && params.tagIds.length > 0) {
      const subquery = this.db
        .select({ foodEntryId: foodEntryTag.foodEntryId })
        .from(foodEntryTag)
        .where(inArray(foodEntryTag.tagId, params.tagIds))
        .groupBy(foodEntryTag.foodEntryId)
        .having(sql`count(${foodEntryTag.tagId}) = ${params.tagIds.length}`)
        .as('subq');
      baseQuery = baseQuery
        .innerJoin(subquery, eq(foodEntry.id, subquery.foodEntryId));
    }

    const sortCol = sortBy === 'rating' ? foodEntry.rating : foodEntry.visitDate;
    const orderedQuery = baseQuery
      .orderBy(sortOrder === 'asc' ? asc(sortCol) : desc(sortCol))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const rows = await orderedQuery;
    const entries = rows.map((row: any) => ('food_entry' in row ? row.food_entry : row));

    let countQuery: any = this.db.select({ count: count() }).from(foodEntry);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    if (params.tagIds && params.tagIds.length > 0) {
      const countSubquery = this.db
        .select({ foodEntryId: foodEntryTag.foodEntryId })
        .from(foodEntryTag)
        .where(inArray(foodEntryTag.tagId, params.tagIds))
        .groupBy(foodEntryTag.foodEntryId)
        .having(sql`count(${foodEntryTag.tagId}) = ${params.tagIds.length}`)
        .as('count_subq');
      countQuery = countQuery
        .innerJoin(countSubquery, eq(foodEntry.id, countSubquery.foodEntryId));
    }
    const countResult = await countQuery;
    const total = Number(countResult[0].count);

    const items: FoodEntryListItem[] = await this.attachTags(entries);
    return { items, total, page, pageSize };
  }

  async findAllMarkers(userId: string, shareViewMode: 'my' | 'all' | 'shared' = 'all'): Promise<FoodEntryMapMarker[]> {
    const groupIds = await this.getUserGroupIds(userId);
    const visibilityConditions: any[] = [];

    if (shareViewMode === 'my') {
      visibilityConditions.push(sql`(${foodEntry.userId}).user_id = ${userId}`);
    } else if (shareViewMode === 'shared') {
      if (groupIds.length > 0) {
        visibilityConditions.push(
          and(
            inArray(foodEntry.groupId, groupIds),
            sql`(${foodEntry.userId}).user_id != ${userId}`
          )
        );
      } else {
        return [];
      }
    } else {
      visibilityConditions.push(sql`(${foodEntry.userId}).user_id = ${userId}`);
      if (groupIds.length > 0) {
        visibilityConditions.push(inArray(foodEntry.groupId, groupIds));
      }
    }

    const entries = await this.db.select().from(foodEntry)
      .where(or(...visibilityConditions))
      .orderBy(desc(foodEntry.visitDate))
      .limit(200);
    const items = await this.attachTags(entries as any);
    const resolved = await this.resolveCreatorInfo(items as any);
    return resolved.map((item: any) => ({
      id: item.id,
      dishName: item.dishName,
      restaurantName: item.restaurantName,
      latitude: item.latitude,
      longitude: item.longitude,
      rating: item.rating,
      images: item.images,
      tags: item.tags.map((t: any) => ({ id: t.id, name: t.name })),
      groupId: item.groupId || null,
      userId: item.userId || null,
      creatorNickname: item.creatorNickname || null,
      creatorColor: item.creatorColor || null,
    }));
  }

  async findOne(id: string, userId: string): Promise<FoodEntry> {
    const groupIds = await this.getUserGroupIds(userId);
    const visibilityConditions: any[] = [];
    visibilityConditions.push(
      and(eq(foodEntry.id, id), sql`(${foodEntry.userId}).user_id = ${userId}`)
    );
    if (groupIds.length > 0) {
      visibilityConditions.push(
        and(eq(foodEntry.id, id), inArray(foodEntry.groupId, groupIds))
      );
    }

    const result = await this.db.select().from(foodEntry)
      .where(or(...visibilityConditions))
      .limit(1);
    if (result.length === 0) {
      throw new NotFoundException('美食记录不存在');
    }
    const items = await this.attachTags(result as any);
    const item = items[0];
    return {
      ...item,
      note: (result[0] as any).note || '',
      createdAt: (result[0] as any).createdAt.toISOString(),
      updatedAt: (result[0] as any).updatedAt.toISOString(),
    };
  }

  async create(dto: CreateFoodEntryRequest, userId: string): Promise<{ id: string }> {
    await this.assertGroupMembership(dto.groupId, userId);

    const result = await this.db
      .insert(foodEntry)
      .values({
        dishName: dto.dishName,
        restaurantName: dto.restaurantName,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        rating: dto.rating,
        note: dto.note || '',
        images: JSON.stringify(dto.images || []),
        visitDate: new Date(dto.visitDate),
        favorite: dto.favorite || false,
        userId,
        groupId: dto.groupId || null,
      })
      .returning({ id: foodEntry.id });

    const entryId = result[0].id;
    if (dto.tagIds && dto.tagIds.length > 0) {
      await this.db.insert(foodEntryTag).values(
        dto.tagIds.map((tagId: string) => ({
          foodEntryId: entryId,
          tagId,
        }))
      );
    }
    return { id: entryId };
  }

  async update(id: string, dto: UpdateFoodEntryRequest, userId: string): Promise<{ success: boolean }> {
    const existing = await this.db.select().from(foodEntry)
      .where(and(eq(foodEntry.id, id), sql`(${foodEntry.userId}).user_id = ${userId}`))
      .limit(1);
    if (existing.length === 0) {
      throw new NotFoundException('美食记录不存在');
    }
    await this.assertGroupMembership(dto.groupId, userId);

    await this.db
      .update(foodEntry)
      .set({
        dishName: dto.dishName,
        restaurantName: dto.restaurantName,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        rating: dto.rating,
        note: dto.note || '',
        images: JSON.stringify(dto.images || []),
        visitDate: new Date(dto.visitDate),
        favorite: dto.favorite || false,
        groupId: dto.groupId || null,
        updatedAt: new Date(),
      })
      .where(eq(foodEntry.id, id));

    await this.db.delete(foodEntryTag).where(eq(foodEntryTag.foodEntryId, id));
    if (dto.tagIds && dto.tagIds.length > 0) {
      await this.db.insert(foodEntryTag).values(
        dto.tagIds.map((tagId: string) => ({
          foodEntryId: id,
          tagId,
        }))
      );
    }
    return { success: true };
  }

  async remove(id: string, userId: string): Promise<{ success: boolean }> {
    const existing = await this.db.select().from(foodEntry)
      .where(and(eq(foodEntry.id, id), sql`(${foodEntry.userId}).user_id = ${userId}`))
      .limit(1);
    if (existing.length === 0) {
      throw new NotFoundException('美食记录不存在');
    }
    await this.db.delete(foodEntry).where(eq(foodEntry.id, id));
    return { success: true };
  }

  async batchDelete(ids: string[], userId: string): Promise<BatchDeleteResponse> {
    if (ids.length === 0) {
      return { success: true, deletedCount: 0 };
    }
    const result = await this.db
      .delete(foodEntry)
      .where(and(inArray(foodEntry.id, ids), sql`(${foodEntry.userId}).user_id = ${userId}`))
      .returning({ id: foodEntry.id });
    return { success: true, deletedCount: result.length };
  }

  async clearAll(userId: string): Promise<BatchDeleteResponse> {
    const result = await this.db.delete(foodEntry)
      .where(sql`(${foodEntry.userId}).user_id = ${userId}`)
      .returning({ id: foodEntry.id });
    return { success: true, deletedCount: result.length };
  }

  async getStatistics(userId: string, shareViewMode?: 'my' | 'all' | 'shared', timeRangeDays?: number): Promise<FoodEntryStatistics> {
    const groupIds = await this.getUserGroupIds(userId);

    const visibilityConditions: any[] = [];

    if (shareViewMode === 'my') {
      visibilityConditions.push(sql`(${foodEntry.userId}).user_id = ${userId}`);
    } else if (shareViewMode === 'shared') {
      if (groupIds.length > 0) {
        visibilityConditions.push(
          and(
            inArray(foodEntry.groupId, groupIds),
            sql`(${foodEntry.userId}).user_id != ${userId}`
          )
        );
      } else {
        visibilityConditions.push(sql`false`);
      }
    } else {
      visibilityConditions.push(sql`(${foodEntry.userId}).user_id = ${userId}`);
      if (groupIds.length > 0) {
        visibilityConditions.push(inArray(foodEntry.groupId, groupIds));
      }
    }

    const filterConditions: any[] = [or(...visibilityConditions)];
    if (timeRangeDays && timeRangeDays > 0) {
      filterConditions.push(sql`${foodEntry.visitDate} >= NOW() - INTERVAL '${sql.raw(String(timeRangeDays))} days'`);
    }
    const visibilityFilter = and(...filterConditions);

    const [totalResult, restaurantResult, avgResult, ratingDistResult, tagDistResult, monthlyResult] = await Promise.all([
      this.db.select({ count: count() }).from(foodEntry).where(visibilityFilter),
      this.db
        .select({ count: sql<number>`COUNT(DISTINCT ${foodEntry.restaurantName})` })
        .from(foodEntry)
        .where(visibilityFilter),
      this.db
        .select({ avg: sql<number>`AVG(${foodEntry.rating})` })
        .from(foodEntry)
        .where(visibilityFilter),
      this.db
        .select({ rating: foodEntry.rating, count: count() })
        .from(foodEntry)
        .where(visibilityFilter)
        .groupBy(foodEntry.rating)
        .orderBy(foodEntry.rating),
      this.db
        .select({
          tagId: foodEntryTag.tagId,
          tagName: tag.name,
          count: count(),
        })
        .from(foodEntryTag)
        .innerJoin(tag, eq(foodEntryTag.tagId, tag.id))
        .innerJoin(foodEntry, eq(foodEntryTag.foodEntryId, foodEntry.id))
        .where(visibilityFilter)
        .groupBy(foodEntryTag.tagId, tag.name)
        .orderBy(sql`count(*) desc`)
        .limit(10),
      this.db
        .select({
          month: sql<string>`TO_CHAR(${foodEntry.visitDate}, 'YYYY-MM')`,
          count: count(),
        })
        .from(foodEntry)
        .where(visibilityFilter)
        .groupBy(sql`TO_CHAR(${foodEntry.visitDate}, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(${foodEntry.visitDate}, 'YYYY-MM')`)
        .limit(12),
    ]);

    const totalEntries = Number(totalResult[0].count);
    const totalRestaurants = Number(restaurantResult[0].count);
    const averageRating = avgResult[0].avg ? Number(Number(avgResult[0].avg).toFixed(1)) : 0;
    const ratingDistribution = ratingDistResult.map((r) => ({
      rating: r.rating,
      count: Number(r.count),
    }));
    const tagDistribution = tagDistResult.map((t) => ({
      tagId: t.tagId,
      tagName: t.tagName,
      count: Number(t.count),
    }));
    const monthlyTrend = monthlyResult.map((m) => ({
      month: m.month,
      count: Number(m.count),
    }));

    return {
      totalEntries,
      totalRestaurants,
      averageRating,
      ratingDistribution,
      tagDistribution,
      monthlyTrend,
    };
  }

  async exportData(format: 'json' | 'csv', userId: string): Promise<string> {
    const entries = await this.db.select().from(foodEntry)
      .where(sql`(${foodEntry.userId}).user_id = ${userId}`)
      .orderBy(desc(foodEntry.visitDate));
    const items = await this.attachTags(entries);

    if (format === 'json') {
      return JSON.stringify(items, null, 2);
    }

    const headers = ['菜名', '店名', '地址', '纬度', '经度', '评分', '备注', '用餐日期', '标签', '收藏'];
    const rows = items.map((item) => [
      item.dishName,
      item.restaurantName,
      item.address,
      item.latitude,
      item.longitude,
      item.rating,
      item.note,
      item.visitDate,
      item.tags.map((t) => t.name).join('/'),
      item.favorite ? '是' : '否',
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    return csv;
  }

  async importData(dto: ImportFoodEntryRequest, userId: string): Promise<ImportFoodEntryResponse> {
    if (dto.mode === 'replace') {
      await this.db.delete(foodEntry)
        .where(sql`(${foodEntry.userId}).user_id = ${userId}`);
    }

    const allNames = Array.from(
      new Set(
        dto.entries
          .flatMap((e) => e.tagNames ?? [])
          .map((n: string) => n.trim())
          .filter(Boolean),
      ),
    );

    const nameToId = new Map<string, string>();
    if (allNames.length > 0) {
      const existing = await this.db
        .select({ id: tag.id, name: tag.name })
        .from(tag)
        .where(inArray(tag.name, allNames));
      existing.forEach((t) => nameToId.set(t.name, t.id));

      const missing = allNames.filter((n) => !nameToId.has(n));
      if (missing.length > 0) {
        const inserted = await this.db
          .insert(tag)
          .values(missing.map((name: string) => ({ name })))
          .returning({ id: tag.id, name: tag.name });
        inserted.forEach((t) => nameToId.set(t.name, t.id));
      }
    }

    const entryValues = dto.entries.map((entry) => ({
      dishName: entry.dishName,
      restaurantName: entry.restaurantName,
      address: entry.address,
      latitude: entry.latitude,
      longitude: entry.longitude,
      rating: entry.rating,
      note: entry.note ?? '',
      images: JSON.stringify(entry.images ?? []),
      visitDate: new Date(entry.visitDate),
      favorite: entry.favorite ?? false,
      userId,
      groupId: null,
    }));

    const inserted = await this.db.insert(foodEntry).values(entryValues).returning({ id: foodEntry.id });

    const tagRelations: Array<{ foodEntryId: string; tagId: string }> = [];
    for (let i = 0; i < dto.entries.length; i++) {
      const entry = dto.entries[i];
      const tagIds = (entry.tagNames ?? [])
        .map((n: string) => nameToId.get(n.trim()))
        .filter((id): id is string => Boolean(id));
      for (const tagId of tagIds) {
        tagRelations.push({ foodEntryId: inserted[i].id, tagId });
      }
    }

    if (tagRelations.length > 0) {
      await this.db.insert(foodEntryTag).values(tagRelations);
    }

    return { success: true, importedCount: inserted.length };
  }

  private async attachTags(entries: any[]): Promise<any[]> {
    if (entries.length === 0) return [];
    const ids = entries.map((e) => e.id);
    const tagRelations = await this.db
      .select({
        foodEntryId: foodEntryTag.foodEntryId,
        tagId: tag.id,
        tagName: tag.name,
        tagColor: tag.color,
      })
      .from(foodEntryTag)
      .innerJoin(tag, eq(foodEntryTag.tagId, tag.id))
      .where(inArray(foodEntryTag.foodEntryId, ids));

    const tagMap = new Map<string, Array<{ id: string; name: string; color: string }>>();
    for (const rel of tagRelations) {
      if (!tagMap.has(rel.foodEntryId)) {
        tagMap.set(rel.foodEntryId, []);
      }
      tagMap.get(rel.foodEntryId)!.push({
        id: rel.tagId,
        name: rel.tagName,
        color: rel.tagColor,
      });
    }

    return entries.map((e: any) => ({
      id: e.id,
      dishName: e.dishName,
      restaurantName: e.restaurantName,
      address: e.address,
      latitude: e.latitude,
      longitude: e.longitude,
      rating: e.rating,
      note: e.note || '',
      images: JSON.parse(e.images || '[]'),
      visitDate: e.visitDate.toISOString(),
      favorite: e.favorite,
      tags: tagMap.get(e.id) || [],
      userId: e.userId || '',
      groupId: e.groupId || null,
      creatorNickname: null,
      creatorColor: null,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }));
  }

  async resolveCreatorInfo(items: FoodEntryListItem[]): Promise<FoodEntryListItem[]> {
    if (items.length === 0) return items;
    const creatorIds = [...new Set(
      items
        .filter((e: any) => e.groupId)
        .map((e: any) => e.userId)
        .filter(Boolean)
    )];
    if (creatorIds.length === 0) return items;

    const profiles = await this.db
      .select()
      .from(userInfo)
      .where(
        sql`(${userInfo.userId}).user_id IN (${sql.join(creatorIds.map((id: string) => sql`${id}`), sql`, `)})`
      );

    const profileMap = new Map<string, { nickname: string; color: string }>();
    for (const p of profiles) {
      profileMap.set(p.userId, { nickname: p.nickname, color: p.color });
    }

    return items.map((item: any) => {
      if (item.groupId && item.userId) {
        const p = profileMap.get(item.userId);
        return { ...item, creatorNickname: p?.nickname || null, creatorColor: p?.color || null };
      }
      return item;
    });
  }
}

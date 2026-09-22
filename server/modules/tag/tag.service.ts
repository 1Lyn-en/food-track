import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { eq, count, desc, sql } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { tag, foodEntryTag } from '../../database/schema';
import type { Tag, CreateTagRequest, UpdateTagRequest } from '@shared/api.interface';

@Injectable()
export class TagService {
  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async findAll(): Promise<Tag[]> {
    const tagsWithCount = await this.db
      .select({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt,
        usageCount: count(foodEntryTag.tagId),
      })
      .from(tag)
      .leftJoin(foodEntryTag, eq(tag.id, foodEntryTag.tagId))
      .groupBy(tag.id)
      .orderBy(sql`count(${foodEntryTag.tagId}) desc`, desc(tag.createdAt));

    return tagsWithCount.map((t) => ({
      ...t,
      usageCount: Number(t.usageCount),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));
  }

  async findOne(id: string): Promise<Tag> {
    const result = await this.db.select().from(tag).where(eq(tag.id, id)).limit(1);
    if (result.length === 0) {
      throw new NotFoundException('标签不存在');
    }
    const t = result[0];
    const countResult = await this.db
      .select({ count: count() })
      .from(foodEntryTag)
      .where(eq(foodEntryTag.tagId, id));
    return {
      id: t.id,
      name: t.name,
      color: t.color,
      usageCount: Number(countResult[0].count),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }

  async create(dto: CreateTagRequest): Promise<Tag> {
    const existing = await this.db.select().from(tag).where(eq(tag.name, dto.name)).limit(1);
    if (existing.length > 0) {
      throw new ConflictException('标签名称已存在');
    }
    const result = await this.db
      .insert(tag)
      .values({
        name: dto.name,
        color: dto.color || '#f97316',
      })
      .returning();
    const t = result[0];
    return {
      id: t.id,
      name: t.name,
      color: t.color,
      usageCount: 0,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }

  async update(id: string, dto: UpdateTagRequest): Promise<{ success: boolean }> {
    const existing = await this.db.select().from(tag).where(eq(tag.id, id)).limit(1);
    if (existing.length === 0) {
      throw new NotFoundException('标签不存在');
    }
    if (dto.name && dto.name !== existing[0].name) {
      const duplicate = await this.db.select().from(tag).where(eq(tag.name, dto.name)).limit(1);
      if (duplicate.length > 0) {
        throw new ConflictException('标签名称已存在');
      }
    }
    await this.db
      .update(tag)
      .set({
        name: dto.name,
        color: dto.color,
        updatedAt: new Date(),
      })
      .where(eq(tag.id, id));
    return { success: true };
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const existing = await this.db.select().from(tag).where(eq(tag.id, id)).limit(1);
    if (existing.length === 0) {
      throw new NotFoundException('标签不存在');
    }
    await this.db.delete(tag).where(eq(tag.id, id));
    return { success: true };
  }
}

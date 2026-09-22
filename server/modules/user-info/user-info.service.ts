import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { userInfo } from '../../database/schema';
import type { UserInfo, CreateUserInfoRequest, UpdateUserInfoRequest } from '@shared/api.interface';

const POP_COLORS = ['#FF3B30', '#FFDE00', '#4CD964', '#007AFF', '#FF9500', '#AF52DE', '#FF2D55', '#5856D6'];

@Injectable()
export class UserInfoService {
  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async findByUserId(userId: string): Promise<UserInfo | null> {
    const result = await this.db
      .select()
      .from(userInfo)
      .where(sql`(${userInfo.userId}).user_id = ${userId}`)
      .limit(1);
    if (result.length === 0) return null;
    return {
      userId: result[0].userId,
      nickname: result[0].nickname,
      color: result[0].color,
      avatar: result[0].avatar ?? null,
    };
  }

  async create(userId: string, dto: CreateUserInfoRequest): Promise<UserInfo> {
    const color = POP_COLORS[Math.floor(Math.random() * POP_COLORS.length)];
    const result = await this.db
      .insert(userInfo)
      .values({ userId, nickname: dto.nickname, color, avatar: dto.avatar ?? null })
      .returning();
    return {
      userId: result[0].userId,
      nickname: result[0].nickname,
      color: result[0].color,
      avatar: result[0].avatar ?? null,
    };
  }

  async update(userId: string, dto: UpdateUserInfoRequest): Promise<UserInfo> {
    const values: Record<string, any> = {};
    if (dto.nickname !== undefined) values.nickname = dto.nickname;
    if (dto.avatar !== undefined) values.avatar = dto.avatar;

    const result = await this.db
      .update(userInfo)
      .set(values)
      .where(sql`(${userInfo.userId}).user_id = ${userId}`)
      .returning();

    if (result.length === 0) {
      throw new NotFoundException('用户信息不存在');
    }

    return {
      userId: result[0].userId,
      nickname: result[0].nickname,
      color: result[0].color,
      avatar: result[0].avatar ?? null,
    };
  }
}
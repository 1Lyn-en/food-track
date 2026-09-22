import { Inject, Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { eq, and, inArray, count, sql } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { collabGroup, collabMember } from '../../database/schema';
import { UserInfoService } from '../user-info/user-info.service';
import type {
  CollabGroup,
  CollabGroupWithMembers,
  CollabMember,
  CreateCollabGroupResponse,
} from '@shared/api.interface';

const SHARE_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const SHARE_CODE_LENGTH = 6;
const MAX_MEMBERS = 5;
const MAX_GROUPS_CREATED = 5;
const MAX_GROUPS_JOINED = 5;
const MAX_SHARE_CODE_RETRIES = 10;

@Injectable()
export class CollabService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
    private readonly userInfoService: UserInfoService,
  ) {}

  async findUserGroups(userId: string): Promise<CollabGroup[]> {
    const memberGroups = await this.db
      .select({ groupId: collabMember.groupId })
      .from(collabMember)
      .where(sql`(${collabMember.userId}).user_id = ${userId}`);

    const groupIds: string[] = memberGroups.map((g: { groupId: string }) => g.groupId);

    if (groupIds.length === 0) {
      return [];
    }

    const groups = await this.db
      .select({
        id: collabGroup.id,
        name: collabGroup.name,
        shareCode: collabGroup.shareCode,
        createdBy: collabGroup.createdBy,
        createdAt: collabGroup.createdAt,
        memberCount: count(collabMember.userId),
      })
      .from(collabGroup)
      .leftJoin(collabMember, eq(collabGroup.id, collabMember.groupId))
      .where(inArray(collabGroup.id, groupIds))
      .groupBy(collabGroup.id);

    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      shareCode: g.shareCode,
      createdBy: g.createdBy ?? '',
      memberCount: Number(g.memberCount),
      createdAt: g.createdAt.toISOString(),
    }));
  }

  async createGroup(
    name: string,
    userId: string,
    nickname: string,
    color: string,
  ): Promise<CreateCollabGroupResponse> {
    const createdCount = await this.countUserCreatedGroups(userId);
    if (createdCount >= MAX_GROUPS_CREATED) {
      throw new BadRequestException(`最多创建 ${MAX_GROUPS_CREATED} 个协作组，请先删除一个`);
    }

    const shareCode: string = await this.generateUniqueShareCode();

    const result = await this.db.transaction(async (tx) => {
      const [group] = await tx
        .insert(collabGroup)
        .values({
          name,
          shareCode,
          createdBy: userId,
        })
        .returning({ id: collabGroup.id, shareCode: collabGroup.shareCode });

      await tx.insert(collabMember).values({
        groupId: group.id,
        userId,
        nickname,
        color,
      });

      return group;
    });

    return result;
  }

  async getGroupDetail(
    groupId: string,
    userId: string,
  ): Promise<CollabGroupWithMembers> {
    const membership = await this.db
      .select({ userId: collabMember.userId })
      .from(collabMember)
      .where(
        and(
          eq(collabMember.groupId, groupId),
          sql`(${collabMember.userId}).user_id = ${userId}`,
        ),
      )
      .limit(1);

    if (membership.length === 0) {
      throw new NotFoundException('协作组不存在');
    }

    const groupResult = await this.db
      .select()
      .from(collabGroup)
      .where(eq(collabGroup.id, groupId))
      .limit(1);

    if (groupResult.length === 0) {
      throw new NotFoundException('协作组不存在');
    }

    const group = groupResult[0];

    const members = await this.db
      .select({
        userId: collabMember.userId,
        nickname: collabMember.nickname,
        color: collabMember.color,
      })
      .from(collabMember)
      .where(eq(collabMember.groupId, groupId));

    const memberList: CollabMember[] = members.map((m) => ({
      userId: m.userId,
      nickname: m.nickname,
      color: m.color,
    }));

    return {
      id: group.id,
      name: group.name,
      shareCode: group.shareCode,
      createdBy: group.createdBy ?? '',
      memberCount: memberList.length,
      createdAt: group.createdAt.toISOString(),
      members: memberList,
    };
  }

  async joinGroup(
    shareCode: string,
    userId: string,
    nickname: string,
    color: string,
  ): Promise<CollabGroup> {
    const joinedCount = await this.countUserJoinedGroups(userId);
    if (joinedCount >= MAX_GROUPS_JOINED) {
      throw new BadRequestException(`最多加入 ${MAX_GROUPS_JOINED} 个协作组，请先退出一个`);
    }

    const groupResult = await this.db
      .select()
      .from(collabGroup)
      .where(eq(collabGroup.shareCode, shareCode))
      .limit(1);

    if (groupResult.length === 0) {
      throw new NotFoundException('协作组不存在或分享码无效');
    }

    const group = groupResult[0];

    const existingMember = await this.db
      .select({ userId: collabMember.userId })
      .from(collabMember)
      .where(
        and(
          eq(collabMember.groupId, group.id),
          sql`(${collabMember.userId}).user_id = ${userId}`,
        ),
      )
      .limit(1);

    if (existingMember.length > 0) {
      throw new BadRequestException('你已经是该协作组成员');
    }

    const memberCount = await this.db.transaction(async (tx) => {
      const countResult = await tx
        .select({ count: count() })
        .from(collabMember)
        .where(eq(collabMember.groupId, group.id));

      const currentCount: number = Number(countResult[0].count);

      if (currentCount >= MAX_MEMBERS) {
        throw new BadRequestException('协作组已满（最多5人）');
      }

      await tx.insert(collabMember).values({
        groupId: group.id,
        userId,
        nickname,
        color,
      });

      return currentCount + 1;
    });

    return {
      id: group.id,
      name: group.name,
      shareCode: group.shareCode,
      createdBy: group.createdBy ?? '',
      memberCount,
      createdAt: group.createdAt.toISOString(),
    };
  }

  async leaveGroup(groupId: string, userId: string): Promise<{ success: boolean }> {
    const existingMember = await this.db
      .select({ userId: collabMember.userId })
      .from(collabMember)
      .where(
        and(
          eq(collabMember.groupId, groupId),
          sql`(${collabMember.userId}).user_id = ${userId}`,
        ),
      )
      .limit(1);

    if (existingMember.length === 0) {
      throw new NotFoundException('你不在该协作组中');
    }

    await this.db.transaction(async (tx) => {
      await tx
        .delete(collabMember)
        .where(
          and(
            eq(collabMember.groupId, groupId),
            sql`(${collabMember.userId}).user_id = ${userId}`,
          ),
        );

      const remainingCount = await tx
        .select({ count: count() })
        .from(collabMember)
        .where(eq(collabMember.groupId, groupId));

      if (Number(remainingCount[0].count) === 0) {
        await tx.delete(collabGroup).where(eq(collabGroup.id, groupId));
      }
    });

    return { success: true };
  }

  async deleteGroup(groupId: string, userId: string): Promise<{ success: boolean }> {
    const groupResult = await this.db
      .select()
      .from(collabGroup)
      .where(eq(collabGroup.id, groupId))
      .limit(1);

    if (groupResult.length === 0) {
      throw new NotFoundException('协作组不存在');
    }

    const group = groupResult[0];
    const isOwner = (group.createdBy ?? '') === userId;
    if (!isOwner) {
      throw new ForbiddenException('只有创建者可以删除协作组');
    }

    await this.db.transaction(async (tx) => {
      await tx.delete(collabMember).where(eq(collabMember.groupId, groupId));
      await tx.delete(collabGroup).where(eq(collabGroup.id, groupId));
    });

    return { success: true };
  }

  async getUserInfoForCollab(userId: string): Promise<{ nickname: string; color: string }> {
    const info = await this.userInfoService.findByUserId(userId);
    if (!info) {
      throw new BadRequestException('请先设置用户信息（昵称和颜色）');
    }
    return info;
  }

  private async countUserCreatedGroups(userId: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(collabGroup)
      .where(sql`(${collabGroup.createdBy}).user_id = ${userId}`);
    return Number(result[0].count);
  }

  private async countUserJoinedGroups(userId: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(collabMember)
      .where(sql`(${collabMember.userId}).user_id = ${userId}`);
    return Number(result[0].count);
  }

  private async generateUniqueShareCode(): Promise<string> {
    for (let i = 0; i < MAX_SHARE_CODE_RETRIES; i++) {
      let code = '';
      for (let j = 0; j < SHARE_CODE_LENGTH; j++) {
        code += SHARE_CODE_CHARS[Math.floor(Math.random() * SHARE_CODE_CHARS.length)];
      }
      const existing = await this.db
        .select({ id: collabGroup.id })
        .from(collabGroup)
        .where(eq(collabGroup.shareCode, code))
        .limit(1);
      if (existing.length === 0) {
        return code;
      }
    }
    throw new Error('无法生成唯一分享码，请重试');
  }
}

import { Controller, Get, Post, Delete, Body, Param, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import type { Request } from 'express';
import { CollabService } from './collab.service';
import type {
  CollabGroup,
  CollabGroupWithMembers,
  CreateCollabGroupRequest,
  JoinCollabGroupRequest,
  CreateCollabGroupResponse,
  CollabGroupListResponse,
} from '@shared/api.interface';

@Controller('api/collab')
@NeedLogin()
export class CollabController {
  constructor(private readonly collabService: CollabService) {}

  @Get('groups')
  async listGroups(@Req() req: Request): Promise<CollabGroupListResponse> {
    const { userId } = req.userContext;
    const groups: CollabGroup[] = await this.collabService.findUserGroups(userId);
    return { groups };
  }

  @Post('groups')
  @HttpCode(HttpStatus.CREATED)
  async createGroup(
    @Req() req: Request,
    @Body() dto: CreateCollabGroupRequest,
  ): Promise<CreateCollabGroupResponse> {
    const { userId } = req.userContext;
    const userInfo = await this.collabService.getUserInfoForCollab(userId);
    return this.collabService.createGroup(dto.name, userId, userInfo.nickname, userInfo.color);
  }

  @Get('groups/:id')
  async getGroupDetail(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<CollabGroupWithMembers> {
    const { userId } = req.userContext;
    return this.collabService.getGroupDetail(id, userId);
  }

  @Post('join')
  @HttpCode(HttpStatus.OK)
  async joinGroup(
    @Req() req: Request,
    @Body() dto: JoinCollabGroupRequest,
  ): Promise<CollabGroup> {
    const { userId } = req.userContext;
    const userInfo = await this.collabService.getUserInfoForCollab(userId);
    return this.collabService.joinGroup(dto.shareCode, userId, userInfo.nickname, userInfo.color);
  }

  @Delete('groups/:id/leave')
  async leaveGroup(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    const { userId } = req.userContext;
    return this.collabService.leaveGroup(id, userId);
  }

  @Delete('groups/:id')
  async deleteGroup(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    const { userId } = req.userContext;
    return this.collabService.deleteGroup(id, userId);
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import type { Response } from 'express';
import { UserInfoService } from './user-info.service';
import type { UserInfo, CreateUserInfoRequest, UpdateUserInfoRequest } from '@shared/api.interface';

@Controller('api/user-info')
export class UserInfoController {
  constructor(private readonly userInfoService: UserInfoService) {}

  @NeedLogin()
  @Get()
  async getCurrent(
    @Req() req: any,
    @Res() res: Response,
  ): Promise<void> {
    const { userId } = req.userContext;
    const info: UserInfo | null =
      await this.userInfoService.findByUserId(userId);
    if (!info) {
      res.status(HttpStatus.NO_CONTENT).send();
      return;
    }
    res.json(info);
  }

  @NeedLogin()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: any,
    @Body() dto: CreateUserInfoRequest,
  ): Promise<UserInfo> {
    const { userId } = req.userContext;
    return this.userInfoService.create(userId, dto);
  }

  @NeedLogin()
  @Put()
  async update(
    @Req() req: any,
    @Body() dto: UpdateUserInfoRequest,
  ): Promise<UserInfo> {
    const { userId } = req.userContext;
    return this.userInfoService.update(userId, dto);
  }
}
import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { TagService } from './tag.service';
import type { Tag, CreateTagRequest, UpdateTagRequest } from '@shared/api.interface';

@Controller('api/tags')
@NeedLogin()
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @NeedLogin()
  @Get()
  async findAll(): Promise<Tag[]> {
    return this.tagService.findAll();
  }

  @NeedLogin()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Tag> {
    return this.tagService.findOne(id);
  }

  @NeedLogin()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTagRequest): Promise<Tag> {
    return this.tagService.create(dto);
  }

  @NeedLogin()
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTagRequest): Promise<{ success: boolean }> {
    return this.tagService.update(id, dto);
  }

  @NeedLogin()
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.tagService.remove(id);
  }
}

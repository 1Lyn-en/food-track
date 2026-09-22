import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, Res, Req } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import type { Request, Response } from 'express';
import { FoodEntryService } from './food-entry.service';
import type {
  FoodEntry,
  FoodEntryListResponse,
  FoodEntryMapMarker,
  CreateFoodEntryRequest,
  UpdateFoodEntryRequest,
  BatchDeleteRequest,
  BatchDeleteResponse,
  ImportFoodEntryRequest,
  ImportFoodEntryResponse,
  FoodEntryStatistics,
} from '@shared/api.interface';

@Controller('api/food-entries')
@NeedLogin()
export class FoodEntryController {
  constructor(private readonly foodEntryService: FoodEntryService) {}

  @NeedLogin()
  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('keyword') keyword?: string,
    @Query('minRating') minRating?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('tagIds') tagIds?: string,
    @Query('sortBy') sortBy?: 'visitDate' | 'rating',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('shareViewMode') shareViewMode?: 'my' | 'all' | 'shared',
  ): Promise<FoodEntryListResponse> {
    const { userId } = req.userContext;
    const result = await this.foodEntryService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      keyword,
      minRating: minRating ? parseInt(minRating, 10) : undefined,
      startDate,
      endDate,
      tagIds: tagIds ? tagIds.split(',').filter(Boolean) : undefined,
      sortBy,
      sortOrder,
      shareViewMode,
      userId,
    });
    result.items = await this.foodEntryService.resolveCreatorInfo(result.items);
    return result;
  }

  @NeedLogin()
  @Get('all')
  async findAllMarkers(@Req() req: Request, @Query('shareViewMode') shareViewMode?: 'my' | 'all' | 'shared'): Promise<FoodEntryMapMarker[]> {
    const { userId } = req.userContext;
    return this.foodEntryService.findAllMarkers(userId, shareViewMode);
  }

  @NeedLogin()
  @Get('statistics')
  async getStatistics(@Req() req: Request, @Query('shareViewMode') shareViewMode?: 'my' | 'all' | 'shared'): Promise<FoodEntryStatistics> {
    const { userId } = req.userContext;
    return this.foodEntryService.getStatistics(userId, shareViewMode);
  }

  @NeedLogin()
  @Get('export')
  async exportData(@Req() req: Request, @Query('format') format: 'json' | 'csv' = 'json', @Res() res: Response): Promise<void> {
    const { userId } = req.userContext;
    const data = await this.foodEntryService.exportData(format, userId);
    const contentType = format === 'json' ? 'application/json' : 'text/csv';
    const filename = `food-entries-${Date.now()}.${format}`;
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(data);
  }

  @NeedLogin()
  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string): Promise<FoodEntry> {
    const { userId } = req.userContext;
    const entry = await this.foodEntryService.findOne(id, userId);
    if (entry.groupId) {
      const [resolved] = await this.foodEntryService.resolveCreatorInfo([entry] as any);
      return resolved as unknown as FoodEntry;
    }
    return entry;
  }

  @NeedLogin()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: Request, @Body() dto: CreateFoodEntryRequest): Promise<{ id: string }> {
    const { userId } = req.userContext;
    return this.foodEntryService.create(dto, userId);
  }

  @NeedLogin()
  @Post('import')
  async importData(@Req() req: Request, @Body() dto: ImportFoodEntryRequest): Promise<ImportFoodEntryResponse> {
    const { userId } = req.userContext;
    return this.foodEntryService.importData(dto, userId);
  }

  @NeedLogin()
  @Put(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateFoodEntryRequest): Promise<{ success: boolean }> {
    const { userId } = req.userContext;
    return this.foodEntryService.update(id, dto, userId);
  }

  @NeedLogin()
  @Delete('batch')
  async batchDelete(@Req() req: Request, @Body() dto: BatchDeleteRequest): Promise<BatchDeleteResponse> {
    const { userId } = req.userContext;
    return this.foodEntryService.batchDelete(dto.ids, userId);
  }

  @NeedLogin()
  @Delete('all')
  async clearAll(@Req() req: Request): Promise<BatchDeleteResponse> {
    const { userId } = req.userContext;
    return this.foodEntryService.clearAll(userId);
  }

  @NeedLogin()
  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string): Promise<{ success: boolean }> {
    const { userId } = req.userContext;
    return this.foodEntryService.remove(id, userId);
  }
}

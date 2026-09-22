import { Module } from '@nestjs/common';
import { FoodEntryController } from './food-entry.controller';
import { FoodEntryService } from './food-entry.service';

@Module({
  controllers: [FoodEntryController],
  providers: [FoodEntryService],
  exports: [FoodEntryService],
})
export class FoodEntryModule {}

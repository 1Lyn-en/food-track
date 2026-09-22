import { Module } from '@nestjs/common';
import { CollabController } from './collab.controller';
import { CollabService } from './collab.service';
import { UserInfoModule } from '../user-info/user-info.module';

@Module({
  imports: [UserInfoModule],
  controllers: [CollabController],
  providers: [CollabService],
  exports: [CollabService],
})
export class CollabModule {}
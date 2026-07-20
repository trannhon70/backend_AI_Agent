import { Module } from '@nestjs/common';
import { QuickReplyCategoriesService } from './quick_reply_categories.service';
import { QuickReplyCategoriesController } from './quick_reply_categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuickReplyCategory } from './entities/quick_reply_category.entity';
import { Fanpage } from '../fanpages/entities/fanpage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuickReplyCategory, Fanpage]),
  ],
  controllers: [QuickReplyCategoriesController],
  providers: [QuickReplyCategoriesService],
})
export class QuickReplyCategoriesModule { }

import { Module } from '@nestjs/common';
import { FanpagesService } from './fanpages.service';
import { FanpagesController } from './fanpages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fanpage } from './entities/fanpage.entity';
import { FanPagesRepository } from './fanpages.repository';
import { FanPagesConsumer } from './fanpages.consumer';
import { PageToken } from '../page_tokens/entities/page_token.entity';
import { UserPage } from '../user_pages/entities/user_page.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fanpage, PageToken, UserPage]),
  ],
  controllers: [FanpagesController, FanPagesConsumer],
  providers: [FanpagesService, FanPagesRepository],
})
export class FanpagesModule { }

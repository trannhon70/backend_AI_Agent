import { Module } from '@nestjs/common';
import { PageTokensService } from './page_tokens.service';
import { PageTokensController } from './page_tokens.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageToken } from './entities/page_token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PageToken]),
  ],
  controllers: [PageTokensController],
  providers: [PageTokensService],
})
export class PageTokensModule { }

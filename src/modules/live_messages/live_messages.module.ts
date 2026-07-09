import { Module } from '@nestjs/common';
import { LiveMessagesService } from './live_messages.service';
import { LiveMessagesController } from './live_messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveMessage } from './entities/live_message.entity';
import { LiveMessagesConsumer } from './live_messages.consumer';
import { LiveMessagesRepository } from './live_messages.repository';
import { PageToken } from '../page_tokens/entities/page_token.entity';
import { Fanpage } from '../fanpages/entities/fanpage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LiveMessage, PageToken, Fanpage])],
  controllers: [LiveMessagesController, LiveMessagesConsumer],
  providers: [LiveMessagesService, LiveMessagesRepository],
})
export class LiveMessagesModule { }

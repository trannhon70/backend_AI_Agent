import { Module } from '@nestjs/common';
import { LiveMessagesService } from './live_messages.service';
import { LiveMessagesController } from './live_messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveMessage } from './entities/live_message.entity';
import { LiveMessagesConsumer } from './live_messages.consumer';
import { LiveMessagesRepository } from './live_messages.repository';
import { PageToken } from '../page_tokens/entities/page_token.entity';
import { Fanpage } from '../fanpages/entities/fanpage.entity';
import { CloudinaryService } from 'src/shared/cloudinary';
import { Conversation } from '../conversations/entities/conversation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LiveMessage, PageToken, Fanpage, Conversation])],
  controllers: [LiveMessagesController, LiveMessagesConsumer],
  providers: [LiveMessagesService, LiveMessagesRepository, CloudinaryService],
})
export class LiveMessagesModule { }

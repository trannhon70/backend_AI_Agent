import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Conversation } from './entities/conversation.entity';
import { LiveMessage } from '../live_messages/entities/live_message.entity';
import { ConversationsConsumer } from './conversations.consumer';
import { ConversationsRepository } from './conversations.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, Conversation, LiveMessage])],
  controllers: [ConversationsController, ConversationsConsumer],
  providers: [ConversationsService, ConversationsRepository],
})
export class ConversationsModule { }

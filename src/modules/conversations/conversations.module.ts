import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Conversation } from './entities/conversation.entity';
import { LiveMessage } from '../live_messages/entities/live_message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Conversation, LiveMessage])],
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule { }

import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Conversation } from './entities/conversation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Conversation])],
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule { }

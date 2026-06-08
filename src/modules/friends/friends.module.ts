import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from './entities/friend.entity';
import { User } from '../users/entities/user.entity';
import { FriendConsumer } from './friend.consumer';
import { FriendRepository } from './friend.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Friend, User])],
  controllers: [FriendsController, FriendConsumer],
  providers: [FriendsService, FriendRepository],
})
export class FriendsModule { }

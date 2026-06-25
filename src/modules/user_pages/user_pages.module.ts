import { Module } from '@nestjs/common';
import { UserPagesService } from './user_pages.service';
import { UserPagesController } from './user_pages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPage } from './entities/user_page.entity';
import { User } from '../users/entities/user.entity';
import { Fanpage } from '../fanpages/entities/fanpage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPage, User, Fanpage]),
  ],
  controllers: [UserPagesController],
  providers: [UserPagesService],
})
export class UserPagesModule { }

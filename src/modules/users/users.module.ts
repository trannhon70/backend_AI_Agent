import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../roles/entities/role.entity';
import { User } from './entities/user.entity';
import { UsersConsumer } from './users.consumer';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  controllers: [UsersController, UsersConsumer],
  providers: [UsersService, UsersRepository],
})

export class UsersModule { }


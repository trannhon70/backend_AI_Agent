// src/redis/redis.module.ts
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisService } from './redis.service';
import { User } from '../users/entities/user.entity';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([User]),

    ],
    providers: [RedisService],
    exports: [RedisService], // Để có thể sử dụng RedisService ở các module khác
})
export class RedisModule { }
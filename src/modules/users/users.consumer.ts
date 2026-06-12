// users/users.consumer.ts
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { currentTimestamp } from 'src/shared/utils/currentTimestamp';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { DomainEvents } from '../kafka/kafka.events';
import { ProviderEnum } from 'src/shared/enums/role.enum';
import { RedisService } from '../redis/redis.service';

let saltOrRounds = 10;
@Controller()
export class UsersConsumer {
    private readonly logger = new Logger(UsersConsumer.name);
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly usersRepoConfig: UsersRepository,

        private readonly redisService: RedisService,
    ) { }

    @EventPattern(DomainEvents.UserCreated)
    async handleUserCreated(@Payload() body: any) {
        try {
            const hashPassword = await bcrypt.hash(body.password, saltOrRounds)
            const data: any = {
                role_id: body.role_id || null,
                email: body.email || null,
                password: hashPassword || null,
                full_name: body.full_name || null,
                ngay_sinh: body.ngay_sinh || null,
                phone: body.phone || null,
                provider: ProviderEnum.LOCAL,
                created_at: currentTimestamp(),
            }
            return await this.usersRepoConfig.create(data)
        } catch (error) {
            this.logger.error('Failed to process user created event', error);
            throw error;
        }
    }

    @EventPattern(DomainEvents.UserUpdateIsOnlne)
    async handleUserUpdateIsOnlne(@Payload() body: any) {
        try {
            await this.usersRepoConfig.update(Number(body.userId), { is_online: false })
            await this.redisService.del(`user:${body.userId}:session`);
        } catch (error) {
            this.logger.error('Failed to process user created event', error);
            throw error;
        }
    }


}
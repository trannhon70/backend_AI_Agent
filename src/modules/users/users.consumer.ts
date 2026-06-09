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

let saltOrRounds = 10;
@Controller()
export class UsersConsumer {
    private readonly logger = new Logger(UsersConsumer.name);
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly usersRepoConfig: UsersRepository,
    ) { }

    @EventPattern(DomainEvents.UserCreated)
    async handleUserCreated(@Payload() body: any) {
        try {
            const users = await this.usersRepoConfig.findAll();

            const hashPassword = await bcrypt.hash(body.password, saltOrRounds)
            const data: any = {
                role_id: body.role_id || null,
                email: body.email || null,
                password: hashPassword || null,
                full_name: body.full_name || null,
                ngay_sinh: body.ngay_sinh || null,
                phone: body.phone || null,
                created_at: currentTimestamp(),
            }
            return await this.usersRepoConfig.create(data)
        } catch (error) {
            this.logger.error('Failed to process user created event', error);
            throw error;
        }
    }

    @EventPattern(DomainEvents.User_update_profile)
    async handleUserUpdateProfile(@Payload() payload: any) {
        try {
            const body = {
                full_name: payload.full_name,
                ngay_sinh: payload.ngay_sinh,
                phone: payload.phone,
                avatar: payload.file ? `${process.env.URL_BACKEND}/api/uploads/${payload.file}` : null
            }
            return await this.usersRepoConfig.update(Number(payload.userId), body)
        } catch (error) {
            this.logger.error('Failed to process user created event', error);
            throw error;
        }
    }

    @EventPattern(DomainEvents.User_close_the_lock)
    async handleUserCloseTheLock(@Payload() payload: any) {
        try {
            if (payload.id) {
                const result = await this.usersRepoConfig.update(payload.id, { is_deleted: payload.is_deleted });
                return result
            }
        } catch (error) {
            this.logger.error('Failed to process user created event', error);
            throw error;
        }
    }

    @EventPattern(DomainEvents.User_update_password)
    async handleUserUpdatePassword(@Payload() payload: any) {
        try {
            const hashPassword = await bcrypt.hash(payload.password, saltOrRounds)
            return await this.usersRepoConfig.update(payload.id, { password: hashPassword })
        } catch (error) {
            this.logger.error('Failed to process user created event', error);
            throw error;
        }
    }

    @MessagePattern(DomainEvents.User_update_item)
    async handleUserUpdateUser(@Payload() payload: any) {
        try {
            const { id, ...data } = payload;
            console.log(payload, 'payload');

            const result = await this.userRepo.update(id, data)
            return {
                success: true,
                result
            };
        } catch (error) {
            this.logger.error('Failed to process user update event', error);
            throw error;
        }
    }
}
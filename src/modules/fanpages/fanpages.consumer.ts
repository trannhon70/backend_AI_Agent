// users/users.consumer.ts
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { currentTimestamp } from 'src/shared/utils/currentTimestamp';
import { DomainEvents } from '../kafka/kafka.events';
import { ProviderEnum } from 'src/shared/enums/role.enum';
import { RedisService } from '../redis/redis.service';
import { FanPagesRepository } from './fanpages.repository';
import { Fanpage } from './entities/fanpage.entity';
import { UserPage } from '../user_pages/entities/user_page.entity';
import { PageToken } from '../page_tokens/entities/page_token.entity';

@Controller()
export class FanPagesConsumer {
    private readonly logger = new Logger(FanPagesConsumer.name);
    constructor(
        @InjectRepository(Fanpage)
        private readonly fanpageRepo: Repository<Fanpage>,

        @InjectRepository(UserPage)
        private readonly userPageRepo: Repository<UserPage>,

        @InjectRepository(PageToken)
        private readonly pageTokenRepo: Repository<PageToken>,

        private readonly fanPagesRepoConfig: FanPagesRepository,

        private readonly redisService: RedisService,
    ) { }

    @MessagePattern(DomainEvents.FanPage_create)
    async handleFanPagesCreated(@Payload() body: any) {
        try {
            body.map(async (item: any) => {
                const page = await this.fanPagesRepoConfig.create({
                    facebook_page_id: item.id,
                    page_name: item.name,
                    page_avatar: item.url,
                    created_at: currentTimestamp()
                })

                await this.userPageRepo.save([{
                    user_id: item.user_id,
                    page_id: page.id,
                    created_at: currentTimestamp(),
                }])

                await this.pageTokenRepo.save([{
                    page_id: page.id,
                    access_token: item.access_token,
                    created_at: currentTimestamp(),
                }])
            })

        } catch (error) {
            this.logger.error('Failed to process user created event', error);
            throw error;
        }
    }


}
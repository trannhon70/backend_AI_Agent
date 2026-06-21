// users/users.consumer.ts
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { currentTimestamp } from 'src/shared/utils/currentTimestamp';
import { Repository } from 'typeorm';
import { DomainEvents } from '../kafka/kafka.events';
import { PageToken } from '../page_tokens/entities/page_token.entity';
import { RedisService } from '../redis/redis.service';
import { UserPage } from '../user_pages/entities/user_page.entity';
import { Fanpage } from './entities/fanpage.entity';
import { FanPagesRepository } from './fanpages.repository';
import { ProviderEnum } from 'src/shared/enums/role.enum';

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

    @MessagePattern(DomainEvents.FanPage_connect_facebook)
    async handleFanPagesCreated(@Payload() payload: any) {
        try {
            // // ✅ lấy danh sách page kết nối facebook
            const result = await fetch(
                'https://graph.facebook.com/v25.0/me/accounts?fields=id,name,category,picture.type(large),access_token',
                {
                    headers: {
                        Authorization: `Bearer ${payload.access_token}`, // <-- fix ở đây
                    },
                }
            );
            const fanpages = await result.json();
            const pages = fanpages?.data?.map((item: any) => ({
                id: item.id,
                name: item.name,
                url: item.picture?.data?.url,
                provider: ProviderEnum.FACEBOOK,
                access_token: item.access_token
            }));

            for (const item of pages) {
                let page: any = await this.fanpageRepo.findOne({
                    where: {
                        page_id: item.id,
                    },
                });

                if (!page) {
                    page = await this.fanPagesRepoConfig.create({
                        page_id: item.id,
                        page_name: item.name,
                        page_avatar: item.url,
                        created_at: currentTimestamp(),
                    });

                    await this.pageTokenRepo.save({
                        page_id: page.id,
                        access_token: item.access_token,
                        created_at: currentTimestamp(),
                    });
                }

                await this.userPageRepo.save({
                    user_id: payload.user_id,
                    page_id: page.id, // ✅ ID trong DB
                    provider: item.provider,
                    created_at: currentTimestamp(),
                });

                //subscribed lấy token của page
                await fetch(
                    `https://graph.facebook.com/v23.0/${item.id}/subscribed_apps?access_token=${item.access_token}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            subscribed_fields: ["messages", "messaging_postbacks", "message_deliveries"],
                        }),
                    }
                );
            }

        } catch (error) {
            this.logger.error('Failed to process user created event', error);
            throw error;
        }
    }


}
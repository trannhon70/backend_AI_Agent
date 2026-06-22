// users/users.consumer.ts
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
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
    async exchangeLongLivedToken(shortLivedToken: string) {
        const url = new URL(
            'https://graph.facebook.com/v25.0/oauth/access_token',
        );

        url.searchParams.append('grant_type', 'fb_exchange_token');
        url.searchParams.append('client_id', process.env.FACEBOOK_APP_ID!);
        url.searchParams.append('client_secret', process.env.FACEBOOK_APP_SECRET!);
        url.searchParams.append('fb_exchange_token', shortLivedToken);

        const response = await fetch(url.toString());

        if (!response.ok) {
            const error = await response.json();
            throw new Error(JSON.stringify(error));
        }

        return await response.json();
    }

    async debugToken(inputToken: string) {
        const url = new URL('https://graph.facebook.com/debug_token');
        url.searchParams.append('input_token', inputToken);
        url.searchParams.append(
            'access_token',
            `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`,
        );
        const response = await fetch(url.toString());
        if (!response.ok) {
            const error = await response.json();
            throw new Error(JSON.stringify(error));
        }
        return await response.json();
    }

    @MessagePattern(DomainEvents.FanPage_connect_facebook)
    async handleFanPagesCreated(@Payload() payload: any) {
        try {
            // tiến hành long token lên thời gian tối đa khoảng 90 ngày
            const token = await this.exchangeLongLivedToken(payload.access_token);
            const debugToken = await this.debugToken(token.access_token);

            // // ✅ lấy danh sách page kết nối facebook
            const result = await fetch(
                'https://graph.facebook.com/v25.0/me/accounts?fields=id,name,category,picture.type(large),access_token',
                {
                    headers: {
                        Authorization: `Bearer ${token.access_token}`, // <-- fix ở đây
                    },
                }
            );

            const fanpages = await result.json();
            const pages = fanpages?.data?.map((item: any) => ({
                id: item.id,
                name: item.name,
                url: item.picture?.data?.url,
                provider: ProviderEnum.FACEBOOK,
                access_token: item.access_token,
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
                        access_token: token.access_token,
                        data_access_expires_at: debugToken.data.data_access_expires_at,
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

    @MessagePattern(DomainEvents.FanPage_tokenRenewal)
    async handleFanPagestokenRenewad(@Payload() payload: any) {
        try {
            console.log(payload, 'payload');
            // tiến hành long token lên thời gian tối đa khoảng 90 ngày
            const token = await this.exchangeLongLivedToken(payload.access_token);
            const debugToken = await this.debugToken(token.access_token);
            console.log(debugToken, 'debugToken');

            // // ✅ lấy danh sách page kết nối facebook
            const result = await fetch(
                'https://graph.facebook.com/v25.0/me/accounts?fields=id,name,category,picture.type(large),access_token',
                {
                    headers: {
                        Authorization: `Bearer ${token.access_token}`, // <-- fix ở đây
                    },
                }
            );

            const fanpages = await result.json();
            const pages = fanpages?.data?.map((item: any) => ({
                id: item.id,
                access_token: item.access_token,
            }));

            for (const item of pages) {

                await this.fanpageRepo.update({ id: payload.fanpage_id }, {
                    access_token: token.access_token,
                    data_access_expires_at: debugToken.data.data_access_expires_at,
                });

                await this.pageTokenRepo.update({ fanpage_id: payload.fanpage_id }, {
                    access_token: item.access_token,
                });
            }

        } catch (error) {
            throw error
        }
    }


}
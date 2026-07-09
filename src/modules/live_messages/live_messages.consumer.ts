// users/users.consumer.ts
import { Controller, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageDirection, MessageType, ProviderEnum, RoleEnumUserPage } from 'src/shared/enums/role.enum';
import { currentTimestamp } from 'src/shared/utils/currentTimestamp';
import { Repository } from 'typeorm';
import { Conversation } from '../conversations/entities/conversation.entity';
import { DomainEvents } from '../kafka/kafka.events';
import { LiveMessage } from '../live_messages/entities/live_message.entity';
import { PageToken } from '../page_tokens/entities/page_token.entity';
import { RedisService } from '../redis/redis.service';
import { UserPage } from '../user_pages/entities/user_page.entity';

import { normalizeAttachments, toUnixTimestamp } from 'src/shared/utils';
import { Fanpage } from '../fanpages/entities/fanpage.entity';
import axios from 'axios';

@Controller()
export class LiveMessagesConsumer {
    private readonly logger = new Logger(LiveMessagesConsumer.name);
    constructor(

        @InjectRepository(PageToken)
        private readonly pageTokenRepo: Repository<PageToken>,

        @InjectRepository(Fanpage)
        private readonly fanpageRepo: Repository<Fanpage>,

        @InjectRepository(LiveMessage)
        private readonly liveMessageRepo: Repository<LiveMessage>,



    ) { }

    @EventPattern(DomainEvents.message_send)
    async handleMessageSend(@Payload() payload: any) {
        const { page_id, customer_id, conversation_id, direction, type, text, user_id } = payload;

        // 1. Lấy access_token, validate sớm
        const fanpage = await this.fanpageRepo
            .createQueryBuilder('fanpage')
            .select('fanpage.id', 'id')
            .where('fanpage.page_id = :pageId', { pageId: page_id })
            .getRawOne();

        const pageToken = await this.pageTokenRepo.createQueryBuilder("pageToken")
            .select("pageToken.access_token", "access_token")
            .where('pageToken.fanpage_id = :fanpage_id', { fanpage_id: fanpage.id })
            .getRawOne();
        const access_token = pageToken.access_token
        if (!access_token) {
            this.logger.error(`No access_token for page_id ${page_id}`);
            return; // không throw để tránh retry vô ích
        }

        // 2. Gửi tin nhắn Facebook — lỗi ở đây KHÔNG nên retry gửi lại
        let fbMessageId: string | undefined;
        try {
            const fbRes = await axios.post(
                'https://graph.facebook.com/v23.0/me/messages',
                { recipient: { id: customer_id }, message: { text } },
                { params: { access_token }, timeout: 10000 }
            );
            fbMessageId = fbRes.data?.message_id;
        } catch (error) {
            this.logger.error(`Failed to send FB message for conversation ${conversation_id}`, error);
            // Có thể lưu trạng thái "failed" vào DB thay vì throw để retry gửi lại
            return;
        }

        // 3. Lưu message vào DB — lỗi ở đây có thể log riêng, không ảnh hưởng việc đã gửi
        try {
            await this.liveMessageRepo.save({
                conversation_id,
                sender_id: customer_id,
                recipient_id: page_id,
                direction,
                type,
                text,
                user_id,
                facebook_mid: fbMessageId,
                sent_at: currentTimestamp(),
                created_at: currentTimestamp(),
            });

        } catch (error) {
            this.logger.error(`FB message sent but failed to save to DB for conversation ${conversation_id}`, error);
            // Tin đã gửi thành công, chỉ log để xử lý thủ công/reconcile sau, KHÔNG throw
        }
    }

}
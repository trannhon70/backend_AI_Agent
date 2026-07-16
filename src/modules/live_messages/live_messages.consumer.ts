import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { currentTimestamp } from 'src/shared/utils/currentTimestamp';
import { Repository } from 'typeorm';
import { DomainEvents } from '../kafka/kafka.events';
import { LiveMessage } from '../live_messages/entities/live_message.entity';
import { PageToken } from '../page_tokens/entities/page_token.entity';

import axios from 'axios';
import { Fanpage } from '../fanpages/entities/fanpage.entity';
import { Conversation } from '../conversations/entities/conversation.entity';

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

        @InjectRepository(Conversation)
        private readonly conversationRepo: Repository<Conversation>,
    ) { }

    @EventPattern(DomainEvents.message_send)
    async handleMessageSend(@Payload() payload: any) {
        await this.send(payload);
    }

    @EventPattern(DomainEvents.message_send_file)
    async handleMessageSendFile(@Payload() payload: any) {
        await this.send(payload);
    }

    private async send(payload: any) {
        const accessToken = await this.getAccessToken(payload.page_id);

        if (!accessToken) {
            this.logger.error(`No access token for page ${payload.page_id}`);
            return;
        }

        const message = this.buildFacebookMessage(payload);

        const fbMessageId = await this.sendToFacebook(
            payload.customer_id,
            accessToken,
            message,
            payload.conversation_id,
        );

        if (!fbMessageId) return;

        await this.saveMessage(payload, fbMessageId);
    }

    private async getAccessToken(pageId: string): Promise<string | null> {
        const fanpage = await this.fanpageRepo
            .createQueryBuilder('fanpage')
            .select('fanpage.id', 'id')
            .where('fanpage.page_id = :pageId', { pageId })
            .getRawOne();

        if (!fanpage) return null;

        const token = await this.pageTokenRepo
            .createQueryBuilder('pageToken')
            .select('pageToken.access_token', 'access_token')
            .where('pageToken.fanpage_id = :id', { id: fanpage.id })
            .getRawOne();

        return token?.access_token ?? null;
    }

    private buildFacebookMessage(payload: any) {
        if (payload.text) {
            return {
                text: payload.text,
            };
        }

        return {
            attachment: {
                type: payload.type,
                payload: {
                    url: payload.url,
                    is_reusable: true,
                },
            },
        };
    }

    private async sendToFacebook(
        customerId: string,
        accessToken: string,
        message: any,
        conversationId: number,
    ) {
        try {
            const res = await axios.post(
                'https://graph.facebook.com/v23.0/me/messages',
                {
                    recipient: {
                        id: customerId,
                    },
                    message,
                },
                {
                    params: {
                        access_token: accessToken,
                    },
                    timeout: 10000,
                },
            );

            return res.data.message_id;
        } catch (err) {
            this.logger.error(
                `Failed to send FB message conversation ${conversationId}`,
                err,
            );
            return null;
        }
    }

    private async saveMessage(payload: any, facebookMid: string) {
        try {
            const savedMessage = await this.liveMessageRepo.save({
                conversation_id: payload.conversation_id,
                sender_id: payload.customer_id,
                recipient_id: payload.page_id,
                direction: payload.direction,
                type: payload.type,
                text: payload.text,
                attachments: payload.attachments,
                user_id: payload.user_id,
                facebook_mid: facebookMid,
                reply_to_id: payload?.reply_to?.facebook_mid ?? null,
                sent_at: currentTimestamp(),
                created_at: currentTimestamp(),
            });
            await this.conversationRepo.update(payload.conversation_id, {
                last_message_id: savedMessage.id ?? '[Attachment]',
                last_message_at: currentTimestamp(),
                updated_at: currentTimestamp(),
            })

        } catch (err) {
            this.logger.error(
                `FB message sent but save DB failed ${payload.conversation_id}`,
                err,
            );
        }
    }
}
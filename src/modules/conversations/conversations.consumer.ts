import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { currentTimestamp } from 'src/shared/utils/currentTimestamp';
import { DomainEvents } from '../kafka/kafka.events';
import { Conversation } from './entities/conversation.entity';
import { ConversationsRepository } from './conversations.repository';
import { LiveMessage } from '../live_messages/entities/live_message.entity';
import { MessageDirection, MessageType } from 'src/shared/enums/role.enum';

let saltOrRounds = 10;
@Controller()
export class ConversationsConsumer {
    private readonly logger = new Logger(ConversationsConsumer.name);
    constructor(
        @InjectRepository(Conversation)
        private readonly ConversationRepo: Repository<Conversation>,
        private readonly ConversationsRepoConfig: ConversationsRepository,

        @InjectRepository(LiveMessage)
        private readonly LiveMessageRepo: Repository<LiveMessage>,
    ) { }

    async findOrCreateConversation(
        pageId: string,
        customerId: string,
    ) {
        await this.ConversationRepo.upsert(
            {
                page_id: pageId,
                customer_id: customerId,
                unread_count: 0,
                created_at: currentTimestamp(),
                updated_at: currentTimestamp(),
            },
            {
                conflictPaths: ['page_id', 'customer_id'],
                skipUpdateIfNoValuesChanged: true,
            },
        );

        return await this.ConversationRepo.findOneOrFail({
            where: {
                page_id: pageId,
                customer_id: customerId,
            },
        });
    }

    @EventPattern(DomainEvents.conversation_create)
    async handleUserCreated(@Payload() payload: any) {
        try {
            for (const entry of payload) {
                const pageId = entry.id;
                for (const event of entry.messaging) {
                    const conversation = await this.findOrCreateConversation(pageId, event.sender.id);
                    console.log(event, 'event');

                    // lưu message
                    const savedMessage = await this.LiveMessageRepo.save({
                        conversation_id: conversation.id,
                        facebook_mid: event.message.mid,
                        sender_id: event.sender.id,
                        recipient_id: event.recipient.id,
                        direction: MessageDirection.INBOUND,
                        type: MessageType.TEXT,
                        text: event.message.text,
                        attachments: event.message.attachments,
                        raw_data: event,
                        sent_at: event.timestamp,
                        created_at: currentTimestamp(),
                    });

                    // update conversation
                    await this.ConversationRepo.update(
                        conversation.id,
                        {
                            last_message_id: savedMessage.id ?? '[Attachment]',
                            last_message_at: currentTimestamp(),
                            updated_at: currentTimestamp(),
                            unread_count: () => `"unread_count" + 1`,
                        },
                    );
                }
            }
        } catch (error) {
            throw error;
        }
    }
}
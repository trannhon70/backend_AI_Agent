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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { normalizeAttachments } from 'src/shared/utils';

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

        private readonly eventEmitter: EventEmitter2,
    ) { }

    async findOrCreateConversation(
        pageId: string,
        customerId: string,
    ) {
        await this.ConversationRepo.upsert(
            {
                page_id: pageId,
                customer_id: customerId,
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
                    const sender_id = event.sender.id;
                    const recipient_id = event.recipient.id;
                    let type = MessageType.TEXT;

                    if (event.message.attachments?.length) {
                        const attachment = event.message.attachments[0];

                        if (attachment.type?.startsWith("image")) {
                            type = MessageType.IMAGE;
                        } else if (attachment.type?.startsWith("video")) {
                            type = MessageType.VIDEO;
                        } else if (attachment.type?.startsWith("audio")) {
                            type = MessageType.AUDIO;
                        } else {
                            type = MessageType.FILE;
                        }
                    }

                    const conversation = await this.findOrCreateConversation(pageId, sender_id);
                    const data_mess = {
                        conversation_id: conversation.id,
                        facebook_mid: event.message.mid,
                        sender_id: sender_id,
                        recipient_id: recipient_id,
                        direction: MessageDirection.CUSTOMER,
                        type: type,
                        text: event.message.text,
                        attachments: normalizeAttachments(event.message.attachments, 'webhook'),
                        raw_data: event,
                        sent_at: event.timestamp,
                        created_at: currentTimestamp(),
                    }
                    const savedMessage = await this.LiveMessageRepo.save(data_mess);

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
                    const updatedConversation = await this.ConversationRepo.findOne({
                        where: {
                            id: conversation.id,
                        },
                    });
                    // lưu message và thực hiện socket
                    this.eventEmitter.emit(DomainEvents.conversation_socket_message, { page_id: conversation.id, message: data_mess, conversation: updatedConversation });
                }
            }
        } catch (error) {
            throw error;
        }
    }
}
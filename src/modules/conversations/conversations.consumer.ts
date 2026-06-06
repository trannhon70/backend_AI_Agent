import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { currentTimestamp } from 'utils/currentTimestamp';
import { DomainEvents } from '../kafka/kafka.events';
import { Conversation } from './entities/conversation.entity';

let saltOrRounds = 10;
@Controller()
export class ConversationsConsumer {
    private readonly logger = new Logger(ConversationsConsumer.name);
    constructor(
        @InjectRepository(Conversation)
        private readonly ConversationRepo: Repository<Conversation>,
        // private readonly ConversationsRepoConfig: ConversationsRepository,
    ) { }


}
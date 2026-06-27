import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { Conversation } from './entities/conversation.entity';

@Injectable()
export class ConversationsService {
    constructor(
        @InjectRepository(Conversation)
        private conversationRepo: Repository<Conversation>,

        private readonly jwtService: JwtService, // Inject JwtService
        private readonly redisService: RedisService,
    ) { }

    async getPagging(user_id: number, query: any) {
        try {
            const pageIndex = query.pageIndex ? parseInt(query.pageIndex, 10) : 1;
            const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : 10;
            const search = query.search || '';
            const page_id = query.page_id || '';
            const skip = (pageIndex - 1) * pageSize;

            const qb = this.conversationRepo.createQueryBuilder('conversation')
                .leftJoinAndSelect('conversation.lastMessage', 'lastMessage')
                .where('conversation.page_id = :page_id', { page_id })
                .addSelect(['lastMessage.text', 'lastMessage.type'])
                .skip(skip)
                .take(pageSize)
                .orderBy('conversation.id', 'DESC');


            if (search) {
                qb.andWhere('conversation.full_name ILIKE :search', {
                    search: `%${search}%`,
                });
            }

            const [result, total] = await qb.getManyAndCount();
            return {
                data: result,
                total: total,
                pageIndex: pageIndex,
                pageSize: pageSize,
                totalPages: Math.ceil(total / pageSize),

            };
        } catch (error) {
            throw error
        }
    }
}

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

            const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : 10;
            const search = query.search || '';
            const page_id = query.page_id || '';
            const lastId = query.lastId ? Number(query.lastId) : undefined;

            const qb = this.conversationRepo.createQueryBuilder('conversation')
                .leftJoin('conversation.lastMessage', 'lastMessage')
                // .where('conversation.page_id = :page_id', { page_id })
                .addSelect(['lastMessage.id', 'lastMessage.text', 'lastMessage.type'])
                .orderBy('conversation.id', 'DESC')
                .take(pageSize)


            if (search) {
                qb.andWhere(`conversation.search_vector @@ plainto_tsquery('simple', :search)`,
                    {
                        search,
                    },
                );
            }

            if (lastId !== undefined) {
                qb.andWhere('conversation.id < :lastId', { lastId });
            }

            const result = await qb.getMany();
            return {
                data: result,
                hasMore: result.length === pageSize,
                lastId: result[result.length - 1]?.id,
            };
        } catch (error) {
            throw error
        }
    }

    async createTest() {
        try {
            const TOTAL = 5000000;
            const BATCH_SIZE = 100000;

            const now = Date.now() / 1000;

            const words: string[] = [
                'nhận', 'thiết', 'kế', 'web', 'app',
                'chat', 'hệ thống', 'CRM', 'API', 'dashboard',
                'quản lý', 'tối ưu', 'PostgreSQL', 'NestJS'
            ];

            const randomText = () => {
                const length = Math.floor(Math.random() * 5) + 3;

                const result: string[] = [];

                for (let i = 0; i < length; i++) {
                    result.push(words[Math.floor(Math.random() * words.length)]);
                }

                return result.join(' ');
            };

            const insertBatch = async (batch: any[]) => {
                const values = batch.map((r) => {
                    const safeText = r.full_name.replace(/'/g, "''");

                    return `(
                    '${r.page_id}',
                    '${r.customer_id}',
                    '${safeText}',
                    ${r.last_message_id ?? null},
                    ${r.last_message_at ?? null},
                    ${r.unread_count},
                    '${r.avatar ?? ''}',
                    ${now},
                    ${now},
                    to_tsvector('simple', '${safeText}')
                )`;
                });

                await this.conversationRepo.query(`
                INSERT INTO conversations
                (
                    page_id,
                    customer_id,
                    full_name,
                    last_message_id,
                    last_message_at,
                    unread_count,
                    avatar,
                    created_at,
                    updated_at,
                    search_vector
                )
                VALUES ${values.join(',')}
                ON CONFLICT (page_id, customer_id)
                DO NOTHING
            `);
            };

            console.log('🚀 Start creating test conversations...');

            for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
                const batch: any[] = [];

                for (let j = 0; j < BATCH_SIZE; j++) {
                    batch.push({
                        page_id: 'page_' + Math.floor(Math.random() * 100),
                        customer_id: 'cus_' + Math.floor(Math.random() * 1_000_000),
                        full_name: randomText(),
                        last_message_id: null,
                        last_message_at: null,
                        unread_count: Math.floor(Math.random() * 10),
                        avatar: null,
                    });
                }

                await insertBatch(batch);

                console.log(`Inserted ${Math.min(i + BATCH_SIZE, TOTAL)} / ${TOTAL}`);
            }

            return {
                success: true,
                message: 'Test conversations created successfully',
            };

        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

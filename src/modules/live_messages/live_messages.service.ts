import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { LiveMessage } from './entities/live_message.entity';
import { currentTimestamp } from 'src/shared/utils/currentTimestamp';
import { MessageDirection, MessageType } from 'src/shared/enums/role.enum';

@Injectable()
export class LiveMessagesService {
  constructor(
    @InjectRepository(LiveMessage)
    private liveMessageRepo: Repository<LiveMessage>,

    private readonly jwtService: JwtService, // Inject JwtService
    private readonly redisService: RedisService,
  ) { }

  async getPaging(query: any) {
    try {
      const pageIndex = query.pageIndex ? parseInt(query.pageIndex, 10) : 1;
      const limit = query.limit ? parseInt(query.limit, 10) : 10;
      const search = query.search || '';
      const conversation_id = query.conversation_id || '';

      const skip = (pageIndex - 1) * limit;
      const qb = this.liveMessageRepo.createQueryBuilder('message')
        .innerJoin('message.conversation', 'conversation')
        .leftJoin('message.user', 'user')
        .select([
          'message.id',
          'message.conversation_id',
          'message.direction',
          'message.type',
          'message.text',
          'message.attachments',
          'message.user_id',
          'message.sent_at',

          'conversation.id',
          'conversation.full_name',
          'conversation.avatar',

          'user.id',
          'user.full_name',
          'user.avatar',
        ])
        .where('message.conversation_id = :conversation_id', { conversation_id })

      if (search) {
        qb.andWhere(
          `message.search_vector @@ websearch_to_tsquery('simple', unaccent(:search))`,
          { search },
        );
      }


      qb.skip(skip).take(limit)
        .orderBy('message.sent_at', 'DESC').addOrderBy('message.id', 'DESC').take(limit + 1);
      const result = await qb.getMany();
      // result.length > limit tức là còn dữ liệu, hasMore = true, còn lại thì false
      const hasMore = result.length > limit;

      return {
        pageIndex: pageIndex,
        limit: limit,
        hasMore: hasMore,
        data: result.slice(0, limit),
      };
    } catch (error) {
      throw error
    }
  }

  async createRandomMessages(user_id: number) {
    try {
      const TOTAL = 1000000;
      const BATCH_SIZE = 100000;

      const texts = [
        'Xin chào',
        'Cho mình hỏi',
        'Sản phẩm còn không',
        'Giá bao nhiêu',
        'Cảm ơn',
        'Đã nhận',
        'OK',
        'Tôi cần hỗ trợ',
        'NestJS',
        'PostgreSQL',
        'Dashboard chat',
        'CRM',
        'API',
        'Random message'
      ];

      const randomText = () => {
        const length = Math.floor(Math.random() * 5) + 3;

        return Array.from({ length }, () =>
          texts[Math.floor(Math.random() * texts.length)]
        ).join(' ');
      };

      const insertBatch = async (batch: any[]) => {

        const values = batch.map((r) => {

          const text = r.text.replace(/'/g, "''");

          return `(
                    ${r.conversation_id},
                    '${r.facebook_mid}',
                    '${r.sender_id}',
                    '${r.recipient_id}',
                    '${r.direction}',
                    '${r.type}',
                    '${text}',
                    NULL,
                    NULL,
                    ${user_id},
                    ${r.sent_at},
                    ${r.created_at}
                )`;

        });

        await this.liveMessageRepo.query(`
                INSERT INTO live_messages
                (
                    conversation_id,
                    facebook_mid,
                    sender_id,
                    recipient_id,
                    direction,
                    type,
                    text,
                    attachments,
                    raw_data,
                    user_id,
                    sent_at,
                    created_at
                )
                VALUES
                ${values.join(',')}
            `);
      };

      console.log('🚀 Start creating live messages...');

      for (let i = 0; i < TOTAL; i += BATCH_SIZE) {

        const batch: any = [];

        for (let j = 0; j < BATCH_SIZE; j++) {
          batch.push({
            conversation_id: 11000002,
            facebook_mid:
              `mid_${i}_${j}_${Math.random().toString(36).slice(2)}`,
            sender_id:
              `sender_${Math.floor(Math.random() * 100000)}`,
            recipient_id:
              `recipient_${Math.floor(Math.random() * 1000)}`,
            direction:
              Math.random() > 0.5
                ? MessageDirection.CUSTOMER
                : MessageDirection.STAFF,
            type:
              MessageType.TEXT,
            text:
              randomText(),
            sent_at: currentTimestamp(),
            created_at: currentTimestamp(),
          });
        }
        await insertBatch(batch);
        console.log(
          `Inserted ${Math.min(i + BATCH_SIZE, TOTAL)} / ${TOTAL}`
        );
      }

      return {
        success: true,
        message: 'Random messages created successfully'
      };

    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

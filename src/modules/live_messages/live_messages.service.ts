import { Injectable } from '@nestjs/common';
import { CreateLiveMessageDto } from './dto/create-live_message.dto';
import { UpdateLiveMessageDto } from './dto/update-live_message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { LiveMessage } from './entities/live_message.entity';

@Injectable()
export class LiveMessagesService {
  constructor(
    @InjectRepository(LiveMessage)
    private liveMessageRepo: Repository<LiveMessage>,

    private readonly jwtService: JwtService, // Inject JwtService
    private readonly redisService: RedisService,
  ) { }

  async getPagging(user_id: number, query: any) {
    try {
      const pageIndex = query.pageIndex ? parseInt(query.pageIndex, 10) : 1;
      const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : 10;
      const search = query.search || '';
      const conversation_id = query.conversation_id || '';
      const skip = (pageIndex - 1) * pageSize;

      const qb = this.liveMessageRepo.createQueryBuilder('message')
        // .leftJoinAndSelect('message.lastMessage', 'lastMessage')
        .select([
          "message.id",
          "message.conversation_id",
          "message.facebook_mid",
          "message.sender_id",
          "message.recipient_id",
          "message.direction",
          "message.type",
          "message.text",
          "message.attachments",
          "message.user_id",
          "message.sent_at",
          "message.created_at",
        ])
        .where('message.conversation_id = :conversation_id', { conversation_id })

        .skip(skip)
        .take(pageSize)
        .orderBy('message.id', 'DESC');


      if (search) {
        qb.andWhere('message.text ILIKE :search', {
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

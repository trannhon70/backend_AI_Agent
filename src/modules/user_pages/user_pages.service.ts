import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { UserPage } from './entities/user_page.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserPagesService {
  constructor(
    @InjectRepository(UserPage)
    private UserPageRepo: Repository<UserPage>,

    private readonly jwtService: JwtService, // Inject JwtService
    private readonly redisService: RedisService,
  ) { }
  async getPaging(user_id: number, query: any) {
    try {
      const pageIndex = query.pageIndex ? parseInt(query.pageIndex, 10) : 1;
      const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : 10;
      const search = query.search || '';
      const provider = query.provider || '';
      const skip = (pageIndex - 1) * pageSize;

      const qb = this.UserPageRepo.createQueryBuilder('user_page')
        .leftJoinAndSelect('user_page.page', 'page')
        .where('user_page.user_id = :user_id', { user_id })
        .skip(skip)
        .take(pageSize)
        .orderBy('user_page.id', 'DESC');

      if (provider) {
        qb.andWhere('user_page.provider = :provider', {
          provider,
        });
      }

      if (search) {
        qb.andWhere('page.page_name ILIKE :search', {
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
      console.log(error);
      throw error
    }
  }
}

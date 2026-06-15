import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { UserPage } from './entities/user_page.entity';

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

  async getCountProvider(user_id: number) {

    try {
      const result = await this.UserPageRepo
        .createQueryBuilder('user_page')
        .select('user_page.provider', 'provider')
        .addSelect('COUNT(*)', 'count')
        .where('user_page.user_id = :user_id', { user_id })
        .groupBy('user_page.provider')
        .getRawMany();

      const total = result.reduce(
        (sum, item) => sum + Number(item.count),
        0,
      );

      return [
        {
          provider: 'Tất cả',
          count: total,
        },
        ...result.map(item => ({
          provider: item.provider,
          count: Number(item.count),
        })),
      ];
    } catch (error) {
      throw error
    }
  }

}

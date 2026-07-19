import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ProviderEnum } from 'src/shared/enums/role.enum';
import { currentTimestamp } from 'src/shared/utils/currentTimestamp';
import { Repository } from 'typeorm';
import { Fanpage } from '../fanpages/entities/fanpage.entity';
import { RedisService } from '../redis/redis.service';
import { User } from '../users/entities/user.entity';
import { GetPagingUserPageDto } from './dto/getpaging-user-page.dto';
import { UserPage } from './entities/user_page.entity';

@Injectable()
export class UserPagesService {
  constructor(
    @InjectRepository(UserPage)
    private UserPageRepo: Repository<UserPage>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Fanpage)
    private fanpageRepo: Repository<Fanpage>,

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

  async delete(param: any) {
    try {
      return await this.UserPageRepo.delete(param)
    } catch (error) {
      throw error
    }
  }

  async createUserPage(body: any) {
    try {
      const { email, role, provider, page_id } = body;
      if (email && role && provider) {
        const check_user = await this.userRepo.findOne({ where: { email: email, provider: provider } });

        if (!check_user) {
          throw new BadRequestException('Tài khoản này hiện tại chưa được đăng ký trong hệ thống!');
        }

        const check_fanPage: any = await this.fanpageRepo.findOne({ where: { page_id: page_id } })
        const check_userPage = await this.UserPageRepo.exists({ where: { user_id: check_user.id, fanpage_id: check_fanPage.id } });

        if (check_userPage) {
          throw new BadRequestException('Tài khoản này đã tồn tại trong page!');
        }
        const data = {
          user_id: check_user.id,
          fanpage_id: check_fanPage.id,
          provider: ProviderEnum.FACEBOOK,
          role: role,
          created_at: currentTimestamp(),
        }
        return await this.UserPageRepo.save(data)
      } else {
        throw new BadRequestException('Tất cả dữ liệu không được bỏ trống !');
      }


    } catch (error) {
      throw error
    }
  }

  async getPagingUserPageActive(query: GetPagingUserPageDto) {
    try {
      const { pageIndex = 1, limit = 10, search, page_id } = query;
      const fanpage = await this.fanpageRepo.findOne({ where: { page_id }, select: { id: true }, });
      if (!fanpage) {
        throw new NotFoundException('Không tìm thấy fanpage!');
      }

      const qb = this.UserPageRepo
        .createQueryBuilder('user_page')
        .leftJoinAndSelect('user_page.user', 'u')
        .select('user_page')
        .addSelect(['u.id', 'u.email', 'u.full_name', 'u.avatar'])
        .where('user_page.fanpage_id = :fanpage_id', { fanpage_id: fanpage.id })

      if (search?.trim()) {
        qb.addSelect(`ts_rank_cd(u.search_vector, websearch_to_tsquery('simple', unaccent(:search)))`, 'rank')
          .andWhere(`u.search_vector @@ websearch_to_tsquery('simple', unaccent(:search))`, { search: search.trim() })
          .orderBy('rank', 'DESC')
          .addOrderBy('user_page.created_at', 'DESC')
          .addOrderBy('user_page.id', 'DESC');
      } else {
        qb.orderBy('user_page.created_at', 'DESC').addOrderBy('user_page.id', 'DESC');
      }

      qb.skip((pageIndex - 1) * limit).take(limit + 1);
      const rows = await qb.getMany();
      const hasMore = rows.length > limit;

      return {
        pageIndex,
        limit,
        hasMore,
        data: hasMore ? rows.slice(0, limit) : rows,
      };
    } catch (error) {
      console.log(error);
      throw error
    }
  }
}

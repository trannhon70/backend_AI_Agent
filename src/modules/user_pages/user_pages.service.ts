import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { UserPage } from './entities/user_page.entity';
import { User } from '../users/entities/user.entity';
import { Fanpage } from '../fanpages/entities/fanpage.entity';
import { ProviderEnum } from 'src/shared/enums/role.enum';
import { currentTimestamp } from 'src/shared/utils/currentTimestamp';

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

  async getPagingUserPageActive(user_id: number, query: any) {
    try {
      const pageIndex = query.pageIndex ? parseInt(query.pageIndex, 10) : 1;
      const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : 10;
      const search = query.search || '';
      const page_id = query.page_id || '';
      const skip = (pageIndex - 1) * pageSize;
      const fanpage = await this.fanpageRepo.findOneByOrFail({ page_id });

      const qb = this.UserPageRepo.createQueryBuilder('user_page')
        .leftJoinAndSelect('user_page.user', 'user')
        .select('user_page')
        .addSelect([
          'user.id',
          'user.email',
          'user.full_name',
          'user.avatar',
        ])
        .skip(skip)
        .take(pageSize)
        .orderBy('user_page.id', 'DESC');

      if (fanpage.id) {
        qb.andWhere('user_page.fanpage_id = :fanpage_id', {
          fanpage_id: fanpage.id,
        });
      }

      if (search) {
        qb.andWhere('user.email ILIKE :search OR user.full_name ILIKE :search', {
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

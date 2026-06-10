import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { DataSource, Repository } from 'typeorm';
import { expirationTime, CheckRoles } from 'src/shared/utils';
import { currentTimestamp } from 'src/shared/utils/currentTimestamp';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService, // Inject JwtService
    private readonly redisService: RedisService,
  ) { }
  async login(body: any, ip: string) {

    const user = await this.userRepo.findOne({
      where: {
        email: body.email
      },
      relations: ['role'], // Liên kết với bảng Roles
    });

    if (!user) {
      throw new BadRequestException('Email không tồn tại!');
    }
    if (user.is_deleted === true) {
      throw new BadRequestException('Tài khoản này đã bị xóa!');
    }

    const isMatch = await bcrypt.compare(String(body.password), String(user.password));

    if (!isMatch) {
      throw new BadRequestException('Password không đúng');
    }

    // Kiểm tra Redis xem có phiên đăng nhập nào chưa
    const currentSession = await this.redisService.get(`user:${user.id}:session`);

    if (currentSession) {
      // Hủy token cũ
      await this.redisService.del(`user:${user.id}:session`);
    }
    const payload = {
      email: user.email,
      id: user.id,
      full_name: user.full_name,
      role: user.role,
    };

    const sessionToken = this.jwtService.sign(payload);

    // Lưu token mới vào Redis với thời gian hết hạn

    const sessionData = {
      token: sessionToken,
      expiresAt: Date.now() + expirationTime,
    };

    await this.redisService.set(`user:${user.id}:session`, sessionData, Math.floor(expirationTime / 1000));

    // ✅ Cập nhật trạng thái online
    user.is_online = true;
    await this.userRepo.save(user);

    return {
      token: sessionToken,
      user: {
        email: user.email,
        id: user.id,
        full_name: user.full_name,
        created_at: user.created_at,
        role: user.role,
        is_online: user.is_online,
        avatar: user.avatar,
      },
      startTime: currentTimestamp(),
      endTime: currentTimestamp() + Math.floor(expirationTime / 1000)
    }
  }

  async GetByIdUser(userId: number) {
    const cacheKey = `user:${userId}`;

    const cacheUser = await this.redisService.get(cacheKey);
    if (cacheUser) {
      return cacheUser;
    }

    const user = await this.dataSource.query(`
      SELECT 
        (to_jsonb(u) - 'password') || jsonb_build_object(
          'role', to_jsonb(r)
        ) AS user
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
      LIMIT 1
    `, [userId]);

    if (!user.length) {
      throw new Error('User not found');
    }

    const userData = user[0].user;
    //Lưu redis 1 tiếng
    await this.redisService.set(cacheKey, userData, 3600);

    return userData;
  }
  async getPagingAdmin(req: any, query: any) {
    try {
      const pageIndex = query.pageIndex ? parseInt(query.pageIndex, 10) : 1;
      const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : 10;
      const search = query.search || "";
      const skip = (pageIndex - 1) * pageSize;
      let whereCondition = '';
      const parameters: any = {};

      if (search) {
        if (whereCondition) whereCondition += ' AND ';
        whereCondition += '(users.full_name LIKE :search OR users.email LIKE :search)';
        parameters.search = `%${search}%`;
      }

      const qb = this.userRepo.createQueryBuilder('users')
        .leftJoinAndSelect('users.role', 'role')
        .skip(skip)
        .take(pageSize)
        .orderBy('users.id', 'DESC');

      if (whereCondition) {
        qb.where(whereCondition, parameters);
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

  async getById(req: any, param: any) {
    try {
      if (param.id) {
        const result = await this.userRepo.findOneBy({ id: param.id });
        return result
      }
    } catch (error) {
      console.log(error);
      throw error
    }
  }

  async update(body: any, param: any) {
    try {
      const result = await this.userRepo.update(param.id, body)
      return result
    } catch (error) {
      console.log(error);
      throw error
    }
  }


  async getPagingNoDelete(user_id: number, query: any) {
    try {
      const user: any = await this.userRepo.findOne({ where: { id: user_id } })
      const pageIndex = query.pageIndex ? parseInt(query.pageIndex, 10) : 1;
      const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : 10;
      const search = query.search || "";
      const skip = (pageIndex - 1) * pageSize;
      let whereCondition = '';
      const is_deleted = false; // Chỉ lấy những người dùng chưa bị xóa
      const parameters: any = {};
      if ([CheckRoles.TUVAN, CheckRoles.QUANLY].includes(user.role_id)) {
        whereCondition += 'user.id = :user_id';
        parameters.user_id = user_id;
      }

      if (is_deleted) {
        whereCondition += 'user.is_deleted = :is_deleted';
        parameters.is_deleted = is_deleted;
      }

      if (search) {
        if (whereCondition) whereCondition += ' AND ';
        whereCondition += '(user.full_name LIKE :search OR user.email LIKE :search)';
        parameters.search = `%${search}%`;
      }

      const qb = this.userRepo.createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .skip(skip)
        .take(pageSize)
        .orderBy('user.id', 'DESC');

      if (whereCondition) {
        qb.where(whereCondition, parameters);
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

  async getPagingUserFriend(req: any, query: any) {
    try {
      const pageIndex = query.pageIndex ? parseInt(query.pageIndex, 10) : 1;
      const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : 10;
      const user_id = query.userId || "";
      const search = query.search || "";
      const skip = (pageIndex - 1) * pageSize;

      const qb = this.userRepo.createQueryBuilder('user')
        .where('user.id != :user_id', { user_id })
        .andWhere('user.is_deleted = :is_deleted', { is_deleted: true });

      // Nếu có giá trị search, thêm điều kiện LIKE vào fullName
      if (search) {
        qb.andWhere('user.full_name LIKE :search', { search: `%${search}%` });
      }

      qb.skip(skip)
        .take(pageSize)
        .orderBy('user.id', 'DESC');

      const [result, total] = await qb.getManyAndCount();

      return {
        data: result,
        total,
        pageIndex,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

}

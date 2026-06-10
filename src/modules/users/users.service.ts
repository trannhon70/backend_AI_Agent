import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { DataSource, Repository } from 'typeorm';
import { expirationTime } from 'src/shared/utils';
import { currentTimestamp } from 'src/shared/utils/currentTimestamp';
import { User } from './entities/user.entity';
import { RedisService } from '../redis/redis.service';
import { RoleEnum } from 'src/shared/enums/role.enum';
let saltOrRounds = 10;

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

  async loginGoogle(body: any) {
    try {
      const user = await this.userRepo.findOne({ where: { email: body.email } });
      const hashPassword = await bcrypt.hash(body.password, saltOrRounds)
      if (!user) {
        const newUser = this.userRepo.save([{
          email: body.email,
          full_name: body.full_name,
          avatar: body.avatar,
          password: hashPassword,
          role_id: RoleEnum.ADMIN_MANAGE,
          created_at: currentTimestamp(),
        }])

        // const payload = {
        //   email: user.email,
        //   id: user.id,
        //   full_name: user.full_name,
        //   role: user.role,
        // };

        // const sessionToken = this.jwtService.sign(payload);

        // // Lưu token mới vào Redis với thời gian hết hạn

        // const sessionData = {
        //   token: sessionToken,
        //   expiresAt: Date.now() + expirationTime,
        // };

        // await this.redisService.set(`user:${user.id}:session`, sessionData, Math.floor(expirationTime / 1000));
      }

      console.log('user', user);
    }
    catch (error) {
      console.log(error);
      throw error;
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


}

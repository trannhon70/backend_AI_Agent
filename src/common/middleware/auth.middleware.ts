import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { NextFunction, Response } from 'express';
import { RedisService } from 'src/modules/redis/redis.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) { }

  async use(req: any, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      throw new UnauthorizedException('Token không hợp lệ hoặc không tồn tại.');
    }

    try {
      // ✅ Bước 1: Verify token
      const decoded = this.jwtService.verify(token);

      // ✅ Bước 2: Kiểm tra phiên trong Redis
      const session = await this.redisService.get(`user:${decoded.id}:session`);

      // ❌ Không có session => đăng xuất
      if (!session) {
        throw new UnauthorizedException('Phiên đăng nhập đã hết hạn hoặc không tồn tại.');
      }

      // ❌ Token không khớp => đăng nhập nơi khác
      if (session.token !== token) {
        // ❌ Không set offline vì user vẫn đang online nơi khác
        throw new UnauthorizedException('Tài khoản đã được đăng nhập nơi khác!');
      }

      // ❌ Token đúng nhưng session đã hết hạn
      if (Date.now() > session.expiresAt) {
        throw new UnauthorizedException('Phiên đăng nhập đã hết hạn hoặc không hợp lệ.');
      }

      // ✅ Token và session hợp lệ
      req.user = decoded;
      next();
    } catch (err) {
      // ✅ Giải mã để lấy userId (nếu có)
      const decoded = this.jwtService.decode(token) as any;
      const userId = decoded?.id;

      // ❌ Nếu lỗi do token hết hạn (JWT), thì set offline
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }

      // ❌ Nếu là lỗi đăng nhập nơi khác thì KHÔNG set offline
      if (
        err instanceof UnauthorizedException &&
        err.message === 'Tài khoản đã được đăng nhập nơi khác!'
      ) {
        throw err; // Không set offline
      }

      throw err;
    }
  }
}

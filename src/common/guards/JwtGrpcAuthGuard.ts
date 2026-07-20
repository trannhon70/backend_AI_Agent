import {
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';

import { RedisService } from 'src/modules/redis/redis.service';


@Injectable()
export class JwtGrpcAuthGuard implements CanActivate {

    constructor(
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
    ) { }


    async canActivate(context: ExecutionContext): Promise<boolean> {
        /** Lấy metadata từ gRPC*/
        const metadata = context.switchToRpc().getContext<Metadata>();

        /**
         * Lấy authorization
         *
         * client gửi:
         * authorization: Bearer token
         */
        const authHeader = metadata.get('authorization')?.[0] as string;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
        if (!token) {
            throw new RpcException({ code: 401, message: 'Token không tồn tại' });
        }

        try {
            /*** Verify JWT*/
            const decoded = this.jwtService.verify(token);
            /**
             * Check session Redis
             *
             * Login lưu:
             *
             * user:{id}:session
             *
             */
            const session = await this.redisService.get(`user:${decoded.id}:session`);
            if (!session) {
                throw new RpcException({ code: 401, message: 'Phiên đăng nhập không tồn tại' });
            }
            /*** Check token hiện tại*/
            if (session.token !== token) {
                throw new RpcException({ code: 401, message: 'Tài khoản đã đăng nhập nơi khác' });
            }
            /*** Check expire session Redis*/
            if (Date.now() > session.expiresAt) {
                throw new RpcException({ code: 401, message: 'Phiên đăng nhập đã hết hạn' });
            }
            /**
             * Gắn user vào metadata
             * để controller lấy ra
             */
            (metadata as any).user = decoded;
            return true;
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw new RpcException({ code: 401, message: 'Token đã hết hạn', });
            }

            if (error instanceof RpcException) {
                throw error;
            }

            throw new RpcException({ code: 401, message: 'Token không hợp lệ' });
        }
    }
}
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { RedisService } from 'src/modules/redis/redis.service';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class JwtGrpcAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {

        const rpcContext = context.switchToRpc();

        const metadata =
            rpcContext.getContext<Metadata>();

        const authHeader =
            metadata.get('authorization')[0] as string;


        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : null;


        if (!token) {
            throw new RpcException({
                statusCode: 401,
                message: 'Token không tồn tại',
            });
        }


        try {

            const decoded =
                this.jwtService.verify(token);


            const session =
                await this.redisService.get(
                    `user:${decoded.id}:session`,
                );


            if (!session) {
                throw new RpcException({
                    statusCode: 401,
                    message: 'Phiên đăng nhập không tồn tại',
                });
            }


            if (session.token !== token) {
                throw new RpcException({
                    statusCode: 401,
                    message: 'Tài khoản đã đăng nhập nơi khác',
                });
            }


            if (Date.now() > session.expiresAt) {
                throw new RpcException({
                    statusCode: 401,
                    message: 'Phiên đăng nhập đã hết hạn',
                });
            }


            // gắn user vào context gRPC
            rpcContext.getContext().user = decoded;


            return true;


        } catch (err) {

            if (err instanceof TokenExpiredError) {
                throw new RpcException({
                    statusCode: 401,
                    message: 'Token đã hết hạn',
                });
            }

            throw err;
        }
    }
}
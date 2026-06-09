import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomJwtModule } from './common/auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SocketModule } from './modules/socket/socket.module';
import { RedisModule } from './modules/redis/redis.module';
import { KafkaModule } from './modules/kafka/kafka.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { getDatabaseConfig } from './config/database.config';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { LiveMessagesModule } from './modules/live_messages/live_messages.module';
import { FriendsModule } from './modules/friends/friends.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // cực kỳ quan trọng
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'), // Thư mục chứa file tĩnh
      serveRoot: '/api/shared/uploads',               // Đường dẫn để truy cập
    }),
    SocketModule,
    CustomJwtModule,
    RedisModule,
    KafkaModule,
    UsersModule,
    RolesModule,
    ConversationsModule,
    LiveMessagesModule,
    FriendsModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { KafkaConstants } from './modules/kafka/kafka.constants';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,

    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: [process.env.URL_BACKEND, process.env.URL_FRONTEND, 'https://crm-ai-gent.vercel.app', 'http://192.168.142.1:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: KafkaConstants.ClientId,
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: KafkaConstants.ConsumerGroups.Default,
        allowAutoTopicCreation: true,
        sessionTimeout: 60000,
        heartbeatInterval: 3000,
        rebalanceTimeout: 60000,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
  Logger.debug(
    `🚀 NestJS application with Kafka is running on ${process.env.PORT}`,
  );
  Logger.debug('📊 Kafdrop UI available at http://localhost:9000');

}
bootstrap();

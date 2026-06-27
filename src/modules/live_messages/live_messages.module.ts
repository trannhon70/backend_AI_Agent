import { Module } from '@nestjs/common';
import { LiveMessagesService } from './live_messages.service';
import { LiveMessagesController } from './live_messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveMessage } from './entities/live_message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LiveMessage])],
  controllers: [LiveMessagesController],
  providers: [LiveMessagesService],
})
export class LiveMessagesModule { }

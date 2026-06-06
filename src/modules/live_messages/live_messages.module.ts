import { Module } from '@nestjs/common';
import { LiveMessagesService } from './live_messages.service';
import { LiveMessagesController } from './live_messages.controller';

@Module({
  controllers: [LiveMessagesController],
  providers: [LiveMessagesService],
})
export class LiveMessagesModule {}

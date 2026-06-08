import { Module } from '@nestjs/common';
import { FacebookWebhookService } from './facebook-webhook.service';
import { FacebookWebhookController } from './facebook-webhook.controller';

@Module({
  controllers: [FacebookWebhookController],
  providers: [FacebookWebhookService],
})
export class FacebookWebhookModule {}

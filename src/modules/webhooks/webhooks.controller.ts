import { Body, Controller, ForbiddenException, Get, Post, Query, Req } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { CheckObjectFacebook } from 'src/shared/utils';
import { KafkaService } from '../kafka/kafka.service';
import { DomainEvents } from '../kafka/kafka.events';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly kafkaService: KafkaService,
  ) { }

  @Get('facebook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {

    if (token === process.env.FB_VERIFY_TOKEN) {
      return challenge;
    }

    throw new ForbiddenException();
  }

  @Post('facebook')
  async handleWebhook(@Req() req: any, @Body() body: any) {


    if (body.object === CheckObjectFacebook.PAGE) {
      await this.kafkaService.publish(DomainEvents.conversation_create, body.entry);
    }
    return 'EVENT_RECEIVED';
  }
}

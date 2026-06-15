import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ForbiddenException } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) { }

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
  handleWebhook(@Body() body: any) {
    console.log(body);
    return 'EVENT_RECEIVED';
  }
}

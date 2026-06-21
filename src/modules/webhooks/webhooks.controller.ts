import { Body, Controller, ForbiddenException, Get, Post, Query, Req } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { CheckObjectFacebook } from 'src/shared/utils';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService
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
  handleWebhook(@Req() req: any, @Body() body: any) {

    console.dir(body, 'body');
    if (body.object === CheckObjectFacebook.PAGE) {

    }
    return 'EVENT_RECEIVED';
  }
}

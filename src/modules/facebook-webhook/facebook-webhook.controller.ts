import { Body, Controller, ForbiddenException, Get, Post, Query } from '@nestjs/common';
import { FacebookWebhookService } from './facebook-webhook.service';

@Controller('facebook-webhook')
export class FacebookWebhookController {
  constructor(private readonly facebookWebhookService: FacebookWebhookService) { }
  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    console.log(challenge, 'challenge');
    console.log(process.env.FB_VERIFY_TOKEN, 'process.env.FB_VERIFY_TOKEN');
    console.log(token, 'token');

    if (
      mode === 'subscribe' &&
      token === process.env.FB_VERIFY_TOKEN
    ) {
      return challenge;
    }

    throw new ForbiddenException('Invalid verify token');
  }

  @Post()
  async receiveMessage(@Body() body: any) {
    console.log(
      JSON.stringify(body, null, 2),
    );

    return 'EVENT_RECEIVED';
  }
}

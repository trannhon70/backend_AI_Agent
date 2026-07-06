import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { LiveMessagesService } from './live_messages.service';

@Controller('live-messages')
export class LiveMessagesController {
  constructor(
    private readonly liveMessagesService: LiveMessagesService
  ) { }

  @Get('get-paging')
  @UseGuards(JwtAuthGuard)
  async getPagging(@Req() req: any, @Query() query: any) {
    const result = await this.liveMessagesService.getPagging(req.user.id, query)
    return {
      statusCode: 1,
      message: 'getpaging messages success!',
      data: result
    };
  }

  @Post('create-random-messages')
  @UseGuards(JwtAuthGuard)
  async createRandomMessages(@Req() req: any) {
    const result = await this.liveMessagesService.createRandomMessages(req.user.id)
    return {
      statusCode: 1,
      message: 'create random messages success!',
      data: result
    };
  }
}

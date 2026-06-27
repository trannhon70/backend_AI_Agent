import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { LiveMessagesService } from './live_messages.service';
import { CreateLiveMessageDto } from './dto/create-live_message.dto';
import { UpdateLiveMessageDto } from './dto/update-live_message.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

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

}

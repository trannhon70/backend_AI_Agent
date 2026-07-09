import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { LiveMessagesService } from './live_messages.service';
import { KafkaService } from '../kafka/kafka.service';
import { DomainEvents } from '../kafka/kafka.events';

@Controller('live-messages')
export class LiveMessagesController {
  constructor(
    private readonly liveMessagesService: LiveMessagesService,
    private readonly kafkaService: KafkaService,
  ) { }

  @Get('get-paging')
  @UseGuards(JwtAuthGuard)
  async getPaging(@Query() query: any) {
    const result = await this.liveMessagesService.getPaging(query)
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

  @Post('')
  @UseGuards(JwtAuthGuard)
  async sendMessages(@Req() req: any, @Body() body: any) {
    const payload = {
      user_id: req.user.id,
      ...body
    }
    await this.kafkaService.publish(DomainEvents.message_send, payload);
    // const result = await this.liveMessagesService.sendMessages(req.user.id, body)
    // return {
    //   statusCode: 1,
    //   message: 'send messages success!',
    //   data: result
    // };
  }
}

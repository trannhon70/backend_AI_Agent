import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ConversationsService } from './conversations.service';
import { GetConversationsDto } from './dto/conversation.dto';
import { DomainEvents } from '../kafka/kafka.events';
import { KafkaService } from '../kafka/kafka.service';

@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly kafkaService: KafkaService,
  ) { }

  @Get('get-paging')
  @UseGuards(JwtAuthGuard)
  async getPagging(@Query() query: GetConversationsDto) {
    const result = await this.conversationsService.getPagging(query)
    return {
      statusCode: 1,
      message: 'get page_id success!',
      data: result
    };
  }

  @Post('create-test')
  async createTest(@Req() req: any) {
    const result = await this.conversationsService.createTest()
    return {
      statusCode: 1,
      message: 'create page_id success!',
      data: result
    };
  }

  @Post('update-unread-count')
  @UseGuards(JwtAuthGuard)
  async updateUnreadCount(@Body() payload: any) {
    const result = await this.kafkaService.send(DomainEvents.conversation_update_unread_count, payload);
    return {
      statusCode: 1,
      message: 'update unread count success!',
      data: result
    };
  }
}

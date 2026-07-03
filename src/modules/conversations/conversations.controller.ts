import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ConversationsService } from './conversations.service';
import { GetConversationsDto } from './dto/conversation.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService
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
}

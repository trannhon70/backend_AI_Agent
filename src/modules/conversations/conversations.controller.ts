import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService
  ) { }

  @Get('get-paging')
  @UseGuards(JwtAuthGuard)
  async getPagging(@Req() req: any, @Query() query: any) {
    const result = await this.conversationsService.getPagging(req.user.id, query)
    return {
      statusCode: 1,
      message: 'get page_id success!',
      data: result
    };
  }
}

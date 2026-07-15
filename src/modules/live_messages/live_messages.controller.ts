import { Body, Controller, Get, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { LiveMessagesService } from './live_messages.service';
import { KafkaService } from '../kafka/kafka.service';
import { DomainEvents } from '../kafka/kafka.events';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/shared/cloudinary';

@Controller('live-messages')
export class LiveMessagesController {
  constructor(
    private readonly liveMessagesService: LiveMessagesService,
    private readonly kafkaService: KafkaService,
    private readonly cloudinaryService: CloudinaryService,
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

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async send(@Req() req: any, @Body() body: any, @UploadedFile() file?: Express.Multer.File,) {

    let attachments = body?.attachments;
    let url = body?.attachments?.[0]?.url;

    if (file) {
      const result: any = await this.cloudinaryService.upload(file);
      url = result.url;
      attachments = [
        {
          id: result.asset_id,
          url: result.url,
          width: result.width,
          height: result.height,
          mime_type: result.resource_type,
          preview_url: result.secure_url,
        },
      ];
    }

    await this.kafkaService.publish(DomainEvents.message_send, {
      user_id: req.user.id,
      ...body,
      url,
      attachments,
    });
  }
}


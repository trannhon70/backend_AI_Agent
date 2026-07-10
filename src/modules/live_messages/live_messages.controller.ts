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

  @Post('')
  @UseGuards(JwtAuthGuard)
  async sendMessages(@Req() req: any, @Body() body: any) {
    const payload = {
      user_id: req.user.id,
      ...body
    }
    await this.kafkaService.publish(DomainEvents.message_send, payload);
  }

  @Post('send-file')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async sendFile(@Req() req: any, @Body() body: any, @UploadedFile() file: Express.Multer.File,) {
    const result: any = await this.cloudinaryService.upload(file);
    const payload = {
      user_id: req.user.id,
      ...body,
      url: result.url,
      attachments: [
        {
          id: result.asset_id,
          url: result.url,
          width: result.width,
          height: result.height,
          mime_type: result.resource_type,
          preview_url: result.secure_url,
        }
      ]
    }
    await this.kafkaService.publish(DomainEvents.message_send_file, payload);

  }
}

// asset_id: '44fdcafe64c295477425b830da57d3b4',
//   public_id: 'chat/kt3h5nmh2asegv9xw0sk',
//   version: 1783647076,
//   version_id: 'a230dea6c088d98ad50365c7c204fd54',
//   signature: '53add347dbb29785a6c9c86e43813d1b74c5e09d',
//   width: 64,
//   height: 64,
//   format: 'png',
//   resource_type: 'image',
//   created_at: '2026-07-10T01:31:16Z',
//   tags: [],
//   bytes: 633,
//   type: 'upload',
//   etag: 'a32392b68d53a66a19907075a81e244c',
//   placeholder: false,
//   url: 'http://res.cloudinary.com/dbvslauh7/image/upload/v1783647076/chat/kt3h5nmh2asegv9xw0sk.png',
//   secure_url: 'https://res.cloudinary.com/dbvslauh7/image/upload/v1783647076/chat/kt3h5nmh2asegv9xw0sk.png',
//   folder: 'chat',
//   original_filename: 'file',
//   api_key: '634127849789218'

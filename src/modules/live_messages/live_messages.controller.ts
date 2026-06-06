import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LiveMessagesService } from './live_messages.service';
import { CreateLiveMessageDto } from './dto/create-live_message.dto';
import { UpdateLiveMessageDto } from './dto/update-live_message.dto';

@Controller('live-messages')
export class LiveMessagesController {
  constructor(private readonly liveMessagesService: LiveMessagesService) {}

  @Post()
  create(@Body() createLiveMessageDto: CreateLiveMessageDto) {
    return this.liveMessagesService.create(createLiveMessageDto);
  }

  @Get()
  findAll() {
    return this.liveMessagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.liveMessagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLiveMessageDto: UpdateLiveMessageDto) {
    return this.liveMessagesService.update(+id, updateLiveMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.liveMessagesService.remove(+id);
  }
}

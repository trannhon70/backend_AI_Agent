import { Injectable } from '@nestjs/common';
import { CreateLiveMessageDto } from './dto/create-live_message.dto';
import { UpdateLiveMessageDto } from './dto/update-live_message.dto';

@Injectable()
export class LiveMessagesService {
  create(createLiveMessageDto: CreateLiveMessageDto) {
    return 'This action adds a new liveMessage';
  }

  findAll() {
    return `This action returns all liveMessages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} liveMessage`;
  }

  update(id: number, updateLiveMessageDto: UpdateLiveMessageDto) {
    return `This action updates a #${id} liveMessage`;
  }

  remove(id: number) {
    return `This action removes a #${id} liveMessage`;
  }
}

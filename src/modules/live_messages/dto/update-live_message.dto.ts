import { PartialType } from '@nestjs/mapped-types';
import { CreateLiveMessageDto } from './create-live_message.dto';

export class UpdateLiveMessageDto extends PartialType(CreateLiveMessageDto) {}

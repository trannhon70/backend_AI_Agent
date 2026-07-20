import { PartialType } from '@nestjs/mapped-types';
import { CreateQuickReplyCategoryDto } from './create-quick_reply_category.dto';

export class UpdateQuickReplyCategoryDto extends PartialType(CreateQuickReplyCategoryDto) {
  id: number;
}

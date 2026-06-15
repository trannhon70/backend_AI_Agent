import { PartialType } from '@nestjs/mapped-types';
import { CreatePageTokenDto } from './create-page_token.dto';

export class UpdatePageTokenDto extends PartialType(CreatePageTokenDto) {}

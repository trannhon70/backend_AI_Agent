import { PartialType } from '@nestjs/mapped-types';
import { CreateUserPageDto } from './create-user_page.dto';

export class UpdateUserPageDto extends PartialType(CreateUserPageDto) {}

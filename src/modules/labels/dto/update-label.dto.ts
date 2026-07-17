import { PartialType } from '@nestjs/mapped-types';
import { CreateLabelDto } from './create-label.dto';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class UpdateLabelDto extends PartialType(CreateLabelDto) {
    @Type(() => Number)
    @IsInt()
    id!: number;
}

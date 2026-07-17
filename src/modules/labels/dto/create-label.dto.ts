import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLabelDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    color!: string;

    @IsString()
    @IsNotEmpty()
    page_id?: string;
}

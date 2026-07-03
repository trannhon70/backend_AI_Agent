export class CreateConversationDto { }
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetConversationsDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    page_id?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    lastId?: number;

    @IsOptional()
    @IsString()
    lastUpdatedAt?: string; // ISO 8601, FE lấy từ response trước
}
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

function normalizeOptionalNumber(value: unknown) {
    if (
        value === undefined ||
        value === null ||
        value === '' ||
        value === 'undefined' ||
        value === 'null'
    ) {
        return undefined;
    }
    return value;
}

export class GetConversationsDto {
    @IsOptional()
    @Transform(({ value }) => normalizeOptionalNumber(value))
    @Type(() => Number)
    @IsInt()
    @Min(1)
    lastId?: number;

    @IsOptional()
    @Transform(({ value }) => normalizeOptionalNumber(value))
    @Type(() => Number)
    @IsInt()
    @Min(1)
    lastUpdatedAt?: number;

    @IsOptional()
    @Transform(({ value }) => {
        if (
            value === undefined ||
            value === null ||
            value === '' ||
            value === 'undefined' ||
            value === 'null'
        ) {
            return 20;
        }

        const n = Number(value);
        return Number.isFinite(n) ? n : 20;
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50000)
    limit?: number;

    @IsOptional()
    @IsString()
    page_id?: string;

    @IsOptional()
    @IsString()
    search?: string;
}
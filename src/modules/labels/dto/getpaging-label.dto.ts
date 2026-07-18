import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';



export class GetPagingLabelDto {
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
    limit?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageIndex?: number;

    @IsOptional()
    @IsString()
    page_id?: string;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === true || value === "true") return true;
        if (value === false || value === "false") return false;
        return undefined;
    })
    @IsBoolean()
    is_deleted?: boolean;
}
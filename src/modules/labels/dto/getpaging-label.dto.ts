import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';



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
    @Max(50000)
    limit?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    pageIndex?: number;

    @IsOptional()
    @IsString()
    page_id?: string;

    @IsOptional()
    @IsString()
    search?: string;
}
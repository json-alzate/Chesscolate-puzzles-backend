import { IsArray, IsIn, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class GetPuzzlesDto {
    @IsInt()
    @Min(400)
    @Max(2800)
    @IsOptional()
    elo?: number;


    @IsString()
    @IsOptional()
    theme?: string;

    @IsString()
    @IsOptional()
    openingFamily?: string;


    @IsString()
    @IsIn(['w', 'b', 'N/A'])
    @IsOptional()
    color?: 'w' | 'b' | 'N/A';

    @IsInt()
    @Min(1)
    @Max(200)
    @IsOptional()
    countToReturn?: number;
}

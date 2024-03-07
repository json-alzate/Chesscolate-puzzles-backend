import { IsArray, IsIn, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class GetPuzzlesDto {
    @IsInt()
    elo: number;

    @IsInt()
    @Min(800)
    @IsOptional()
    rangeStart?: number;

    @IsInt()
    @Max(3000)
    @IsOptional()
    rangeEnd?: number;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    themes?: string[];

    @IsString()
    @IsOptional()
    openingFamily?: string;

    @IsString()
    @IsOptional()
    openingVariation?: string;

    @IsString()
    @IsIn(['w', 'b'])
    @IsOptional()
    color?: 'w' | 'b';
}

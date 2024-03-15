import { IsArray, IsIn, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class GetPuzzlesDto {
    @IsInt()
    elo: number;


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

    @IsOptional()
    countToReturn?: number;
}

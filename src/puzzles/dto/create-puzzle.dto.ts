import { IsString, IsNumber, IsArray } from 'class-validator';

export class CreatePuzzleDto {
    @IsString()
    uid: string;
    @IsString()
    fen: string;
    @IsString()
    moves: string;
    @IsNumber()
    rating: number;
    @IsNumber()
    ratingDeviation: number;
    @IsNumber()
    popularity: number;
    @IsNumber()
    randomNumberQuery: number;
    @IsNumber()
    nbPlays: number;
    @IsArray()
    themes: string[];
    @IsString()
    gameUrl: string;
    @IsString()
    openingFamily: string;
    @IsString()
    openingVariation: string;
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Puzzle {
    @Prop({ unique: true, required: true })
    uid: string;
    @Prop({ required: true })
    fen: string;
    @Prop({ required: true })
    moves: string;
    @Prop({ required: true })
    rating: number;
    @Prop({ required: true })
    ratingDeviation: number;
    popularity: number;
    @Prop({ required: true })
    randomNumberQuery: number;
    nbPlays: number;
    themes: string[];
    gameUrl: string;
    openingFamily: string;
    openingVariation: string;
}

export const PuzzleSchema = SchemaFactory.createForClass(Puzzle);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Puzzle extends Document {
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

    @Prop({ required: true })
    randomNumberQuery: number;

    @Prop({ default: 0 })
    popularity: number;

    @Prop({ default: 0 })
    nbPlays: number;

    @Prop({ default: '' })
    theme: string;

    @Prop({ default: '' })
    gameUrl: string;

    @Prop({ default: '' })
    openingFamily: string;

    @Prop({ default: '' })
    openingVariation: string;
}

export const PuzzleSchema = SchemaFactory.createForClass(Puzzle);

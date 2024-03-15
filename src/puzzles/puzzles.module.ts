import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { LoadService } from './load.service';
import { PuzzlesService } from './puzzles.service';
import { PuzzlesController } from './puzzles.controller';

import { PuzzleSchema } from './entities/puzzle.entity';

@Module({
  controllers: [PuzzlesController],
  providers: [LoadService, PuzzlesService],
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Puzzle',
        schema: PuzzleSchema
      }
    ])
  ]
})
export class PuzzlesModule { }

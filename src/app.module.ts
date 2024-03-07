import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MongooseModule } from '@nestjs/mongoose';

import { PuzzlesModule } from './puzzles/puzzles.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGO_URI,
      { dbName: 'puzzle-db' }
    ),
    PuzzlesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

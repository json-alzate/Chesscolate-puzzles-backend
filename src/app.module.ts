import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MongooseModule } from '@nestjs/mongoose';

import { PuzzlesModule } from './puzzles/puzzles.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGO_URI
    ),
    PuzzlesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {

}

import { Injectable } from '@nestjs/common';
import { CreatePuzzleDto } from './dto/create-puzzle.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';

// src/puzzles/puzzles.service.ts
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Puzzle } from './entities/puzzle.entity'; // Ajusta la importación según tu estructura
import * as fs from 'fs';
import * as csv from 'csv-parser';

@Injectable()
export class PuzzlesService {

  constructor(@InjectModel(Puzzle.name) private puzzleModel: Model<Puzzle>) { }

  create(createPuzzleDto: CreatePuzzleDto) {
    return 'This action adds a new puzzle';
  }

  findAll() {
    return `This action returns all puzzles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} puzzle`;
  }

  update(id: number, updatePuzzleDto: UpdatePuzzleDto) {
    return `This action updates a #${id} puzzle`;
  }

  remove(id: number) {
    return `This action removes a #${id} puzzle`;
  }

  async countAllPuzzles(): Promise<number> {
    return await this.puzzleModel.countDocuments();
  }


  async addPuzzlesFromCSV(filePath: string): Promise<void> {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {



        for (const puzzleData of results) {

          // Divide el campo OpeningTags por espacios para obtener un array de tags
          const openingTags = puzzleData.OpeningTags ? puzzleData.OpeningTags.split(' ') : [];

          let openingFamily = '';
          let openingVariation = '';

          if (openingTags.length > 0) {
            // Asigna el primer tag a openingFamily
            openingFamily = openingTags[0];

            // Si hay más tags, toma el segundo para openingVariation
            if (openingTags.length > 1) {
              openingVariation = openingTags[1];
            }
          }

          const puzzleToAdd = new this.puzzleModel({
            uid: puzzleData.PuzzleId,
            fen: puzzleData.FEN,
            moves: puzzleData.Moves,
            rating: Number(puzzleData.Rating),
            ratingDeviation: Number(puzzleData.RatingDeviation),
            popularity: Number(puzzleData.Popularity),
            nbPlays: Number(puzzleData.NbPlays),
            randomNumberQuery: this.randomNumber(),
            themes: puzzleData.Themes ? puzzleData.Themes.split(' ') : [],
            gameUrl: puzzleData.GameUrl,
            openingFamily,
            openingVariation
          });

          try {
            await puzzleToAdd.save();
          } catch (error) {
            console.error('Error saving puzzle to MongoDB', error);
          }
        }
        console.log('All puzzles have been successfully added to the database.');
      });
  }

  // Función para generar un número aleatorio
  randomNumber(): number {
    return Math.floor(Math.random() * 10000);
  }

}

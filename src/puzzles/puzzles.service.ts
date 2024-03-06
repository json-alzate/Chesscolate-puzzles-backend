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

  async getPuzzles(elo: number, options?: {
    rangeStart?: number;
    rangeEnd?: number;
    themes?: string[];
    openingFamily?: string;
    openingVariation?: string;
    color?: 'w' | 'b';
  }): Promise<Puzzle[]> {
    const DEFAULT_RANGE = 600;
    let eloStart = 0;
    let eloEnd = 3000;
    const MAX_ATTEMPTS = 5;
    const PUZZLES_TO_RETURN = 200;
    let attempts = 0;

    if (elo === -1) {
      eloStart = options.rangeStart ?? 800; // Usa un valor por defecto si no se proporciona
      eloEnd = options.rangeEnd ?? 3000; // Usa un valor por defecto si no se proporciona
    } else {
      eloStart = elo - (options?.rangeStart ?? DEFAULT_RANGE);
      eloEnd = elo + (options?.rangeEnd ?? DEFAULT_RANGE);
    }

    while (attempts < MAX_ATTEMPTS && eloStart >= 800 && eloEnd <= 3000) {
      // Construye la consulta base
      let queryConditions = {
        rating: { $gte: eloStart, $lte: eloEnd }
      };

      if (options?.themes && options.themes.length > 0) {
        queryConditions['themes'] = { $in: options.themes };
      }

      if (options?.openingFamily) {
        queryConditions['openingFamily'] = options.openingFamily;
      }

      if (options?.openingVariation) {
        queryConditions['openingVariation'] = options.openingVariation;
      }

      // Intenta obtener los puzzles
      const puzzles = await this.puzzleModel.find(queryConditions).limit(PUZZLES_TO_RETURN).exec();

      if (puzzles.length >= PUZZLES_TO_RETURN) {
        console.log('count ', puzzles.length, 'attempts ', attempts);

        return puzzles;
      }

      // Ajusta el rango de ELO para el siguiente intento
      eloStart = Math.max(800, eloStart - 100);
      eloEnd = Math.min(3000, eloEnd + 100);
      attempts++;
    }

    return []; // Devuelve un array vacío si no se encuentran puzzles después de los intentos máximos
  }


  // -------------------- uploadPuzzlesFromCSV --------------------

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
            openingFamily: openingFamily ? openingFamily : '',
            openingVariation: openingVariation ? openingVariation : ''
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

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
    let puzzlesAccumulated: Puzzle[] = [];

    if (elo === -1) {
      eloStart = options.rangeStart ?? 800;
      eloEnd = options.rangeEnd ?? 3000;
    } else {
      eloStart = elo - (options?.rangeStart ?? DEFAULT_RANGE);
      eloEnd = elo + (options?.rangeEnd ?? DEFAULT_RANGE);
    }

    while (attempts < MAX_ATTEMPTS && puzzlesAccumulated.length < PUZZLES_TO_RETURN) {
      const randomNumber = this.randomNumber();

      // Añade el filtro de selección aleatoria a tus condiciones de consulta
      let queryConditions = {
        rating: { $gte: eloStart, $lte: eloEnd },
        randomNumberQuery: { $gte: randomNumber }, // Utiliza el número aleatorio para la selección aleatoria
        ...(options?.color && { fen: { $regex: ` ${options.color} ` } }),
      };

      console.log('randomNumberQuery', randomNumber, 'attempts', attempts, 'queryConditions', queryConditions);

      if (options?.themes && options.themes.length > 0) {
        queryConditions['themes'] = { $in: options.themes };
      }

      if (options?.openingFamily) {
        queryConditions['openingFamily'] = options.openingFamily;
      }

      if (options?.openingVariation) {
        queryConditions['openingVariation'] = options.openingVariation;
      }

      const puzzles = await this.puzzleModel.find(queryConditions).limit(PUZZLES_TO_RETURN - puzzlesAccumulated.length).exec();
      puzzlesAccumulated = puzzlesAccumulated.concat(puzzles);

      if (puzzlesAccumulated.length >= PUZZLES_TO_RETURN) {
        return this.shuffleArray(puzzlesAccumulated);
      }
      // Ajusta el rango de ELO para el siguiente intento
      eloStart = Math.max(800, eloStart - 50);
      eloEnd = Math.min(3000, eloEnd + 50);
      attempts++;
    }

    return this.shuffleArray(puzzlesAccumulated);
  }

  private shuffleArray(array: Puzzle[]): Puzzle[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // selecciona un índice aleatorio desde 0 hasta i
      [array[i], array[j]] = [array[j], array[i]]; // intercambia elementos array[i] y array[j]
    }
    return array;
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

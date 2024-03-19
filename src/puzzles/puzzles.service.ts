import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';


import { LoadService } from './load.service';

// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
import { Puzzle } from './entities/puzzle.entity';
import * as fs from 'fs';
import * as csv from 'csv-parser';

@Injectable()
export class PuzzlesService {

  // private redisClient = createClient({ url: process.env.REDIS_URL });

  private themes = ["opening", "middlegame", "endgame", "rookEndgame", "bishopEndgame", "pawnEndgame", "knightEndgame", "queenEndgame", "queenRookEndgame", "advancedPawn", "attackingF2F7", "capturingDefender", "discoveredAttack", "doubleCheck", "exposedKing", "fork", "hangingPiece", "kingsideAttack", "pin", "queensideAttack", "sacrifice", "skewer", "trappedPiece", "attraction", "clearance", "defensiveMove", "deflection", "interference", "intermezzo", "quietMove", "xRayAttack", "zugzwang", "mate", "mateIn1", "mateIn2", "mateIn3", "mateIn4", "mateIn5", "anastasiaMate", "arabianMate", "backRankMate", "bodenMate", "doubleBishopMate", "dovetailMate", "hookMate", "smotheredMate", "equality", "advantage", "crushing", "mate", "oneMove", "short", "long", "veryLong"];



  constructor(
    // @InjectModel(Puzzle.name) private puzzleModel: Model<Puzzle>,
    private loadService: LoadService) {
  }





  async getPuzzles(elo: number, options?: {
    theme?: string;
    openingFamily?: string;
    color?: 'w' | 'b' | 'N/A';
  }, countToReturn = 200): Promise<Puzzle[]> {

    if (countToReturn > 200) {
      countToReturn = 200;
    }

    console.log('options ', options);

    let puzzles: Puzzle[] = [];


    if (options?.openingFamily && options?.openingFamily.length > 0) {
      console.log('buscando puzzles por apertura');

      puzzles = await this.loadService.findPuzzlesByOpening(
        options.openingFamily,
        elo || 1500, options.color || 'N/A', countToReturn);
    } else {
      // se obtienen los puzzles por tema o por defecto se obtienen los puzzles de los 3 temas principales
      // eligiendo un tema aleatorio
      puzzles = this.loadService.findPuzzlesByTheme(
        options.theme || this.themes[Math.floor(Math.random() * this.themes.length)],
        elo || 1500, options.color || 'N/A', countToReturn);
    }
    console.log(puzzles.length, 'puzzles encontrados');


    // se mezclan los puzzles
    return this.shuffleArray(puzzles).slice(0, countToReturn);

  }

  private shuffleArray(array: Puzzle[]): Puzzle[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // selecciona un índice aleatorio desde 0 hasta i
      [array[i], array[j]] = [array[j], array[i]]; // intercambia elementos array[i] y array[j]
    }
    return array;
  }

  // -------------------- database operations --------------------

  async countAllPuzzles(): Promise<number> {
    return 0;
    // return await this.puzzleModel.countDocuments();
  }


  async getPuzzlesByThemeFromDB(theme: string, eloStart, eloEnd): Promise<Puzzle[]> {
    return [];
    // return await this.puzzleModel.find({
    //   themes: theme,
    //   rating: { $gte: eloStart, $lte: eloEnd }
    // }).exec();
  }


  async getPuzzlesByOpeningFromDB(opening: string, eloStart, eloEnd): Promise<Puzzle[]> {
    return [];
    // return await this.puzzleModel.find({
    //   openingFamily: opening,
    //   rating: { $gte: eloStart, $lte: eloEnd }
    // }).exec();
  }


  // -------------------- write files --------------------

  async writeThemesInFiles(): Promise<void> {

    const themes = ["opening", "middlegame", "endgame", "rookEndgame", "bishopEndgame", "pawnEndgame", "knightEndgame", "queenEndgame", "queenRookEndgame", "advancedPawn", "attackingF2F7", "capturingDefender", "discoveredAttack", "doubleCheck", "exposedKing", "fork", "hangingPiece", "kingsideAttack", "pin", "queensideAttack", "sacrifice", "skewer", "trappedPiece", "attraction", "clearance", "defensiveMove", "deflection", "interference", "intermezzo", "quietMove", "xRayAttack", "zugzwang", "mate", "mateIn1", "mateIn2", "mateIn3", "mateIn4", "mateIn5", "anastasiaMate", "arabianMate", "backRankMate", "bodenMate", "doubleBishopMate", "dovetailMate", "hookMate", "smotheredMate", "equality", "advantage", "crushing", "mate", "oneMove", "short", "long", "veryLong"];


    const indexFilePath = join(__dirname, `../../puzzlesFilesThemes/index.json`);
    let indexData = {};

    if (existsSync(indexFilePath)) {
      indexData = JSON.parse(readFileSync(indexFilePath, 'utf8'));
    }

    for (const theme of themes) {
      const themePath = join(__dirname, `../../puzzlesFilesThemes/${theme}`);
      mkdirSync(themePath, { recursive: true });

      if (!indexData[theme]) indexData[theme] = [];

      for (let eloStart = 400; eloStart <= 2800; eloStart += 20) {
        const eloEnd = eloStart + 19;
        const filePath = join(themePath, `${theme}_${eloStart}_${eloEnd}.json`);

        if (!existsSync(filePath)) {
          const puzzlesDB = await this.getPuzzlesByThemeFromDB(theme, eloStart, eloEnd);

          if (puzzlesDB.length > 0) {
            writeFileSync(filePath, JSON.stringify(puzzlesDB));
            console.log(`Puzzles for ${theme} and ELO range: ${eloStart}-${eloEnd} saved to file: ${filePath}`, puzzlesDB.length);

            // Agrega los detalles al objeto de índice
            indexData[theme].push({ eloRange: `${eloStart}-${eloEnd}`, fileName: `${theme}_${eloStart}_${eloEnd}.json`, count: puzzlesDB.length });
          } else {
            console.log(`No puzzles found for ${theme} and ELO range: ${eloStart}-${eloEnd}`);
          }
        } else {
          console.log(`File already exists for theme: ${theme} and ELO range: ${eloStart}-${eloEnd}, skipping save.`);
        }
      }
    }

    // Escribe o actualiza el archivo de índice
    writeFileSync(indexFilePath, JSON.stringify(indexData, null, 2));
  }

  async writeOpeningsInFiles(): Promise<void> {

    const openings = ["Sicilian_Defense", "French_Defense", "Queens_Pawn_Game", "Italian_Game", "Caro-Kann_Defense", "Scandinavian_Defense", "Queens_Gambit_Declined", "English_Opening", "Ruy_Lopez", "Indian_Defense", "Scotch_Game", "Russian_Game", "Philidor_Defense", "Modern_Defense", "Four_Knights_Game", "Kings_Gambit_Accepted", "Zukertort_Opening", "Bishops_Opening", "Slav_Defense", "Pirc_Defense", "Kings_Pawn_Game", "Vienna_Game", "Queens_Gambit_Accepted", "Kings_Indian_Defense", "Benoni_Defense", "Nimzowitsch_Defense", "Alekhine_Defense", "Nimzo-Larsen_Attack", "Horwitz_Defense", "Kings_Gambit_Declined", "Owen_Defense", "Bird_Opening", "Dutch_Defense", "Nimzo-Indian_Defense", "Vant_Kruijs_Opening", "Semi-Slav_Defense", "Center_Game", "Hungarian_Opening", "Englund_Gambit_Complex", "Three_Knights_Opening", "Ponziani_Opening", "Englund_Gambit", "Grunfeld_Defense", "Blackmar-Diemer_Gambit", "Elephant_Gambit", "Polish_Opening", "Danish_Gambit", "Kings_Indian_Attack", "Rat_Defense", "Kings_Gambit", "Trompowsky_Attack", "English_Defense", "Grob_Opening", "Rapport-Jobava_System", "Kings_Knight_Opening", "Van_Geet_Opening", "Tarrasch_Defense", "Old_Indian_Defense", "Danish_Gambit_Accepted", "Catalan_Opening", "Reti_Opening", "Queens_Indian_Defense", "London_System"];


    const indexFilePath = join(__dirname, `../../puzzlesFilesOpenings/index.json`);
    let indexData = {};

    if (existsSync(indexFilePath)) {
      indexData = JSON.parse(readFileSync(indexFilePath, 'utf8'));
    }

    for (const opening of openings) {
      const openingPath = join(__dirname, `../../puzzlesFilesOpenings/${opening}`);
      mkdirSync(openingPath, { recursive: true });

      if (!indexData[opening]) indexData[opening] = [];

      for (let eloStart = 400; eloStart <= 2800; eloStart += 20) {
        const eloEnd = eloStart + 19;
        const filePath = join(openingPath, `${opening}_${eloStart}_${eloEnd}.json`);

        if (!existsSync(filePath)) {
          const puzzlesDB = await this.getPuzzlesByOpeningFromDB(opening, eloStart, eloEnd);

          if (puzzlesDB.length > 0) {
            writeFileSync(filePath, JSON.stringify(puzzlesDB));
            console.log(`Puzzles for ${opening} and ELO range: ${eloStart}-${eloEnd} saved to file: ${filePath}`, puzzlesDB.length);

            // Agrega los detalles al objeto de índice
            indexData[opening].push({ eloRange: `${eloStart}-${eloEnd}`, fileName: `${opening}_${eloStart}_${eloEnd}.json`, count: puzzlesDB.length });
          } else {
            console.log(`No puzzles found for ${opening} and ELO range: ${eloStart}-${eloEnd}`);
          }
        } else {
          console.log(`File already exists for opening: ${opening} and ELO range: ${eloStart}-${eloEnd}, skipping save.`);
        }
      }
    }

    // Escribe o actualiza el archivo de índice
    writeFileSync(indexFilePath, JSON.stringify(indexData, null, 2));

  }


  // -------------------- uploadPuzzlesFromCSV --------------------

  // async addPuzzlesFromCSV(filePath: string): Promise<void> {
  //   const results = [];

  //   fs.createReadStream(filePath)
  //     .pipe(csv())
  //     .on('data', (data) => results.push(data))
  //     .on('end', async () => {



  //       for (const puzzleData of results) {

  //         // Divide el campo OpeningTags por espacios para obtener un array de tags
  //         const openingTags = puzzleData.OpeningTags ? puzzleData.OpeningTags.split(' ') : [];

  //         let openingFamily = '';
  //         let openingVariation = '';

  //         if (openingTags.length > 0) {
  //           // Asigna el primer tag a openingFamily
  //           openingFamily = openingTags[0];

  //           // Si hay más tags, toma el segundo para openingVariation
  //           if (openingTags.length > 1) {
  //             openingVariation = openingTags[1];
  //           }
  //         }

  //         const puzzleToAdd = new this.puzzleModel({
  //           uid: puzzleData.PuzzleId,
  //           fen: puzzleData.FEN,
  //           moves: puzzleData.Moves,
  //           rating: Number(puzzleData.Rating),
  //           ratingDeviation: Number(puzzleData.RatingDeviation),
  //           popularity: Number(puzzleData.Popularity),
  //           nbPlays: Number(puzzleData.NbPlays),
  //           randomNumberQuery: this.randomNumber(),
  //           themes: puzzleData.Themes ? puzzleData.Themes.split(' ') : [],
  //           gameUrl: puzzleData.GameUrl,
  //           openingFamily: openingFamily ? openingFamily : '',
  //           openingVariation: openingVariation ? openingVariation : ''
  //         });

  //         try {
  //           await puzzleToAdd.save();
  //         } catch (error) {
  //           console.error('Error saving puzzle to MongoDB', error);
  //         }
  //       }
  //       console.log('All puzzles have been successfully added to the database.');
  //     });
  // }

  // Función para generar un número aleatorio
  randomNumber(): number {
    return Math.floor(Math.random() * 10000);
  }

}

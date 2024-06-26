import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync, readdir, createReadStream } from 'fs';
import { join } from 'path';

import { Puzzle } from './entities/puzzle.entity';


interface PuzzleInfo {
    eloRange: string;
    fileName: string;
    count: number;
}

@Injectable()
export class LoadService implements OnModuleInit {
    private puzzlesIndex = new Map<string, PuzzleInfo[]>();
    private puzzleThemesCache = new Map<string, any[]>(); // Añade caché para puzzles
    private puzzleOpeningsCache = new Map<string, any[]>(); // Añade caché para puzzles

    async onModuleInit() {


        // listar archivos en un directorio
        // const dirPath = '/puzzlesdata/storage/puzzlesFilesThemes/';
        // readdir(dirPath, (err, files) => {
        //     if (err) {
        //         console.error(`Error al listar los archivos en: ${dirPath}`, err);
        //         return;
        //     }
        //     console.log(`Archivos en ${dirPath}:`, files);
        // });

        await this.loadPuzzlesThemesIndex();
        await this.loadPuzzlesOpeningIndex();

    }

    async loadPuzzlesThemesIndex() {

        let indexPath = join(__dirname, '../../puzzlesfiles', '/puzzlesFilesThemes/index.json');
        if (process.env.PUZZLES_PATH) {
            indexPath = join(process.env.PUZZLES_PATH, '/puzzlesFilesThemes/index.json');
        }
        const indexData = JSON.parse(readFileSync(indexPath, 'utf8'));
        for (const theme in indexData) {
            this.puzzlesIndex.set(theme, indexData[theme]);
        }
    }

    async loadPuzzlesOpeningIndex() {

        let indexPath = join(__dirname, '../../puzzlesfiles', '/puzzlesFilesOpenings/index.json');
        if (process.env.PUZZLES_PATH) {
            indexPath = join(process.env.PUZZLES_PATH, '/puzzlesFilesOpenings/index.json');
        }

        const indexData = JSON.parse(readFileSync(indexPath, 'utf8'));
        for (const theme in indexData) {
            this.puzzlesIndex.set(theme, indexData[theme]);
        }
    }

    findPuzzlesByTheme(theme: string, elo: number, color: 'w' | 'b' | 'N/A', totalPuzzlesNeeded: number = 200): Puzzle[] {
        const themeInfo = this.puzzlesIndex.get(theme);
        if (!themeInfo) return [];

        let puzzles = [];
        // Comenzar búsqueda en archivos que coincidan o superen el ELO
        let index = themeInfo.findIndex(info => {
            const [eloStart, eloEnd] = info.eloRange.split('-').map(Number);
            return elo <= eloEnd;
        });

        // console.log(themeInfo[index]);



        // Cargar puzzles avanzando hacia rangos de ELO superiores
        while (puzzles.length < totalPuzzlesNeeded && index < themeInfo.length) {

            puzzles = this.loadAndCachePuzzlesThemes(themeInfo[index], theme, puzzles);

            if (color === 'w' || color === 'b') {
                puzzles = puzzles.filter(puzzle => {
                    const fenParts = puzzle.fen.split(' ');
                    const puzzleColor = fenParts[1];
                    return puzzleColor === color;
                });

            }
            index++;
        }

        // Si se necesitan más puzzles, retroceder hacia rangos de ELO inferiores
        index = themeInfo.findIndex(info => {
            const [_, eloEnd] = info.eloRange.split('-').map(Number);
            return elo <= eloEnd;
        }) - 1;

        while (puzzles.length < totalPuzzlesNeeded && index >= 0) {
            puzzles = this.loadAndCachePuzzlesThemes(themeInfo[index], theme, puzzles, true); // Prepend para mantener orden
            if (color === 'w' || color === 'b') {
                puzzles = puzzles.filter(puzzle => {
                    const fenParts = puzzle.fen.split(' ');
                    const puzzleColor = fenParts[1];
                    return puzzleColor === color;
                });
            }
            index--;
        }

        return puzzles.slice(0, totalPuzzlesNeeded);
    }


    findPuzzlesByOpening(opening: string, elo: number, color: 'w' | 'b' | 'N/A', totalPuzzlesNeeded: number = 200): Puzzle[] {
        const openingInfo = this.puzzlesIndex.get(opening);
        if (!openingInfo) return [];

        let puzzles = [];
        // Comenzar búsqueda en archivos que coincidan o superen el ELO
        let index = openingInfo.findIndex(info => {
            const [eloStart, eloEnd] = info.eloRange.split('-').map(Number);
            return elo <= eloEnd;
        });

        // Cargar puzzles avanzando hacia rangos de ELO superiores
        while (puzzles.length < totalPuzzlesNeeded && index < openingInfo.length) {
            puzzles = this.loadAndCachePuzzlesOpenings(openingInfo[index], opening, puzzles);
            if (color === 'w' || color === 'b') {
                puzzles = puzzles.filter(puzzle => {
                    const fenParts = puzzle.fen.split(' ');
                    const puzzleColor = fenParts[1];
                    return puzzleColor === color;
                });
            }
            index++;
        }

        // Si se necesitan más puzzles, retroceder hacia rangos de ELO inferiores
        index = openingInfo.findIndex(info => {
            const [_, eloEnd] = info.eloRange.split('-').map(Number);
            return elo <= eloEnd;
        }) - 1;

        while (puzzles.length < totalPuzzlesNeeded && index >= 0) {
            puzzles = this.loadAndCachePuzzlesOpenings(openingInfo[index], opening, puzzles, true); // Prepend para mantener orden
            if (color === 'w' || color === 'b') {
                puzzles = puzzles.filter(puzzle => {
                    const fenParts = puzzle.fen.split(' ');
                    const puzzleColor = fenParts[1];
                    return puzzleColor === color;
                });
            }
            index--;
        }

        return puzzles.slice(0, totalPuzzlesNeeded);
    }



    private loadAndCachePuzzlesThemes(info: PuzzleInfo, theme: string, existingPuzzles: any[], prepend: boolean = false): any[] {
        const cacheKey = `${theme}-${info.fileName}`;
        let puzzlesData;

        if (this.puzzleThemesCache.has(cacheKey)) {
            puzzlesData = this.puzzleThemesCache.get(cacheKey);
            puzzlesData = this.shuffleArray(puzzlesData);
        } else {
            let puzzlesPath = join(__dirname, '../../puzzlesfiles', `/puzzlesFilesThemes/${theme}/${info.fileName}`);
            if (process.env.PUZZLES_PATH) {
                puzzlesPath = join(process.env.PUZZLES_PATH, `/puzzlesFilesThemes/${theme}/${info.fileName}`);
            }
            puzzlesData = JSON.parse(readFileSync(puzzlesPath, 'utf8'));
            puzzlesData = this.shuffleArray(puzzlesData);
            this.puzzleThemesCache.set(cacheKey, puzzlesData); // Carga perezosa y almacenamiento en caché
        }

        return prepend ? puzzlesData.concat(existingPuzzles) : existingPuzzles.concat(puzzlesData);
    }

    private loadAndCachePuzzlesOpenings(info: PuzzleInfo, opening: string, existingPuzzles: any[], prepend: boolean = false): any[] {
        const cacheKey = `${opening}-${info.fileName}`;
        let puzzlesData;

        if (this.puzzleOpeningsCache.has(cacheKey)) {
            puzzlesData = this.puzzleOpeningsCache.get(cacheKey);
            puzzlesData = this.shuffleArray(puzzlesData);
        } else {
            let puzzlesPath = join(__dirname, '../../puzzlesfiles', `/puzzlesFilesOpenings/${opening}/${info.fileName}`);
            if (process.env.PUZZLES_PATH) {
                puzzlesPath = join(process.env.PUZZLES_PATH, `/puzzlesFilesOpenings/${opening}/${info.fileName}`);
            }
            puzzlesData = JSON.parse(readFileSync(puzzlesPath, 'utf8'));
            puzzlesData = this.shuffleArray(puzzlesData);
            this.puzzleOpeningsCache.set(cacheKey, puzzlesData); // Carga perezosa y almacenamiento en caché
        }

        return prepend ? puzzlesData.concat(existingPuzzles) : existingPuzzles.concat(puzzlesData);
    }

    private shuffleArray(array: Puzzle[]): Puzzle[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // selecciona un índice aleatorio desde 0 hasta i
            [array[i], array[j]] = [array[j], array[i]]; // intercambia elementos array[i] y array[j]
        }
        return array;
    }
}

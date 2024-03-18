import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync, readdir, createReadStream } from 'fs';
import { join } from 'path';

import { Puzzle } from './entities/puzzle.entity';

import * as unzipper from 'unzipper';



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

        // // descomprimir zip de puzzles
        // // Ruta del archivo .zip
        // const zipFilePath = join('/puzzlesdata/storage/puzzles_folder.zip');
        // // Directorio donde descomprimir
        // const extractPath = join('/puzzlesdata/storage/');
        // console.log('__dirname v2 fix', zipFilePath, extractPath);
        // createReadStream(zipFilePath)
        //     .pipe(unzipper.Extract({ path: extractPath }))
        //     .on('finish', () => console.log('Descompresión completada.'))
        //     .on('error', (err) => console.error('Error al descomprimir:', err));


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

        console.log('__dirname', __dirname);
        console.log('process.env.PUZZLES_PATH', process.env.PUZZLES_PATH);



        let indexPath = join(__dirname, '../../puzzlesfiles', '/puzzlesFilesThemes/index.json');
        if (process.env.PUZZLES_PATH) {
            indexPath = join('/puzzlesdata/storage/puzzlesFilesThemes/indextest.json');
        }
        const indexData = JSON.parse(readFileSync(indexPath, 'utf8'));
        for (const theme in indexData) {
            this.puzzlesIndex.set(theme, indexData[theme]);
        }
    }

    async loadPuzzlesOpeningIndex() {

        let indexPath = join(__dirname, '../../puzzlesfiles', '/puzzlesFilesOpenings/index.json');
        if (process.env.PUZZLES_PATH) {
            indexPath = join('/puzzlesdata/storage/puzzlesFilesOpenings/index.json');
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


        // Cargar puzzles avanzando hacia rangos de ELO superiores
        while (puzzles.length < totalPuzzlesNeeded && index < themeInfo.length) {
            puzzles = this.loadAndCachePuzzlesThemes(themeInfo[index], theme, puzzles);
            if (color === 'w' || color === 'b') {
                puzzles = puzzles.filter(puzzle => puzzle.color === color);
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
                puzzles = puzzles.filter(puzzle => puzzle.color === color);
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
                puzzles = puzzles.filter(puzzle => puzzle.color === color);
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
                puzzles = puzzles.filter(puzzle => puzzle.color === color);
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
        } else {
            let puzzlesPath = join(__dirname, '../../puzzlesfiles', `/puzzlesFilesThemes/${theme}/${info.fileName}`);
            if (process.env.PUZZLES_PATH) {
                puzzlesPath = join(process.env.PUZZLES_PATH, `/puzzlesFilesThemes/${theme}/${info.fileName}`);
            }
            puzzlesData = JSON.parse(readFileSync(puzzlesPath, 'utf8'));
            this.puzzleThemesCache.set(cacheKey, puzzlesData); // Carga perezosa y almacenamiento en caché
        }

        return prepend ? puzzlesData.concat(existingPuzzles) : existingPuzzles.concat(puzzlesData);
    }

    private loadAndCachePuzzlesOpenings(info: PuzzleInfo, opening: string, existingPuzzles: any[], prepend: boolean = false): any[] {
        const cacheKey = `${opening}-${info.fileName}`;
        let puzzlesData;

        if (this.puzzleOpeningsCache.has(cacheKey)) {
            puzzlesData = this.puzzleOpeningsCache.get(cacheKey);
        } else {
            let puzzlesPath = join(__dirname, '../../puzzlesfiles', `/puzzlesFilesOpenings/${opening}/${info.fileName}`);
            if (process.env.PUZZLES_PATH) {
                puzzlesPath = join(process.env.PUZZLES_PATH, `/puzzlesFilesOpenings/${opening}/${info.fileName}`);
            }
            puzzlesData = JSON.parse(readFileSync(puzzlesPath, 'utf8'));
            this.puzzleOpeningsCache.set(cacheKey, puzzlesData); // Carga perezosa y almacenamiento en caché
        }

        return prepend ? puzzlesData.concat(existingPuzzles) : existingPuzzles.concat(puzzlesData);
    }
}

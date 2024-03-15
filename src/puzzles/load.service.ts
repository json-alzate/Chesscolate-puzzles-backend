import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

import { Puzzle } from './entities/puzzle.entity'; // Ajusta la importación según tu estructura


interface PuzzleInfo {
    eloRange: string;
    fileName: string;
    count: number;
}

@Injectable()
export class LoadService implements OnModuleInit {
    private puzzlesIndex = new Map<string, PuzzleInfo[]>();
    private puzzleCache = new Map<string, any[]>(); // Añade caché para puzzles

    async onModuleInit() {
        await this.loadPuzzlesIndex();
    }

    async loadPuzzlesIndex() {
        const indexPath = join(__dirname, '..', 'assets/puzzlesFilesThemes/index.json');
        const indexData = JSON.parse(readFileSync(indexPath, 'utf8'));
        for (const theme in indexData) {
            this.puzzlesIndex.set(theme, indexData[theme]);
        }
    }

    findPuzzles(theme: string, elo: number, color: 'w' | 'b' | 'N/A', totalPuzzlesNeeded: number = 200): Puzzle[] {
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
            puzzles = this.loadAndCachePuzzles(themeInfo[index], theme, puzzles);
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
            puzzles = this.loadAndCachePuzzles(themeInfo[index], theme, puzzles, true); // Prepend para mantener orden
            if (color === 'w' || color === 'b') {
                puzzles = puzzles.filter(puzzle => puzzle.color === color);
            }
            index--;
        }

        return puzzles.slice(0, totalPuzzlesNeeded);
    }




    private loadAndCachePuzzles(info: PuzzleInfo, theme: string, existingPuzzles: any[], prepend: boolean = false): any[] {
        const cacheKey = `${theme}-${info.fileName}`;
        let puzzlesData;

        if (this.puzzleCache.has(cacheKey)) {
            puzzlesData = this.puzzleCache.get(cacheKey);
        } else {
            const puzzlesPath = join(__dirname, '..', `assets/puzzlesFilesThemes/${theme}/${info.fileName}`);
            puzzlesData = JSON.parse(readFileSync(puzzlesPath, 'utf8'));
            this.puzzleCache.set(cacheKey, puzzlesData); // Carga perezosa y almacenamiento en caché
        }

        return prepend ? puzzlesData.concat(existingPuzzles) : existingPuzzles.concat(puzzlesData);
    }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';

import { PuzzlesService } from './puzzles.service';
import { CreatePuzzleDto } from './dto/create-puzzle.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';

@Controller('puzzles')
export class PuzzlesController {
  constructor(private readonly puzzlesService: PuzzlesService) { }

  @Post('/upload')
  uploadPuzzles() {
    // Ajusta la ruta al archivo CSV según donde lo hayas ubicado en tu proyecto
    const filePath = './src/assets/puzzles_upload.csv';
    // return this.puzzlesService.addPuzzlesFromCSV(filePath);
  }

  @Get('/count')
  async getCount() {
    const count = await this.puzzlesService.countAllPuzzles();
    return { total: count };
  }

  @Post()
  create(@Body() createPuzzleDto: CreatePuzzleDto) {
    return this.puzzlesService.create(createPuzzleDto);
  }

  @Get('/')
  async getPuzzles(
    @Query('elo', ParseIntPipe) elo: number,
    @Query('rangeStart', ParseIntPipe) rangeStart?: number,
    @Query('rangeEnd', ParseIntPipe) rangeEnd?: number,
    @Query('themes') themes?: string,
    @Query('openingFamily') openingFamily?: string,
    @Query('openingVariation') openingVariation?: string,
    @Query('color') color?: 'w' | 'b'
  ) {
    // Parsea 'themes' como un array de strings si se proporciona
    const themesArray = themes ? themes.split(',') : undefined;

    return this.puzzlesService.getPuzzles(elo, {
      rangeStart,
      rangeEnd,
      themes: themesArray,
      openingFamily,
      openingVariation,
      color,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.puzzlesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePuzzleDto: UpdatePuzzleDto) {
    return this.puzzlesService.update(+id, updatePuzzleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.puzzlesService.remove(+id);
  }
}

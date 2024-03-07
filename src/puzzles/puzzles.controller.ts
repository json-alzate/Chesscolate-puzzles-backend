import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';

import { PuzzlesService } from './puzzles.service';
import { CreatePuzzleDto } from './dto/create-puzzle.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';
import { GetPuzzlesDto } from './dto/get-puzzles.dto';

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
    // return this.puzzlesService.create(createPuzzleDto);
  }

  @Post('/get-puzzles')
  async getPuzzles(@Body() getPuzzlesDto: GetPuzzlesDto) {
    return this.puzzlesService.getPuzzles(
      getPuzzlesDto.elo,
      {
        rangeStart: getPuzzlesDto.rangeStart,
        rangeEnd: getPuzzlesDto.rangeEnd,
        themes: getPuzzlesDto.themes,
        openingFamily: getPuzzlesDto.openingFamily,
        openingVariation: getPuzzlesDto.openingVariation,
        color: getPuzzlesDto.color,
      }
    );
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.puzzlesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePuzzleDto: UpdatePuzzleDto) {
    // return this.puzzlesService.update(+id, updatePuzzleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // return this.puzzlesService.remove(+id);
  }
}

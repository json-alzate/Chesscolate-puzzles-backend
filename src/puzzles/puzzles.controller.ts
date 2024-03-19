import { Controller, Get, Post, Query } from '@nestjs/common';

import { PuzzlesService } from './puzzles.service';
import { GetPuzzlesDto } from './dto/get-puzzles.dto';

@Controller('puzzles')
export class PuzzlesController {
  constructor(private readonly puzzlesService: PuzzlesService) { }

  // @Post('/upload')
  // uploadPuzzles() {
  //   // Ajusta la ruta al archivo CSV según donde lo hayas ubicado en tu proyecto
  //    const filePath = './src/assets/puzzles_upload.csv';
  //    return this.puzzlesService.addPuzzlesFromCSV(filePath);
  // }


  @Get('/get-puzzles')
  async getPuzzles(@Query() getPuzzlesDto: GetPuzzlesDto) {
    const elo = getPuzzlesDto.elo >= 400 && getPuzzlesDto.elo <= 2800 ? getPuzzlesDto.elo : 1500;
    const countToReturn = getPuzzlesDto.countToReturn && getPuzzlesDto.countToReturn <= 200 ? getPuzzlesDto.countToReturn : 200;

    return this.puzzlesService.getPuzzles(
      elo,
      {
        theme: getPuzzlesDto.theme,
        openingFamily: getPuzzlesDto.openingFamily,
        color: getPuzzlesDto.color,
      },
      countToReturn
    );
  }



}

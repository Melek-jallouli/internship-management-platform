import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CompetencesService } from "./competences.service";

@Controller('competences')
export class CompetencesController {
  constructor(private readonly service: CompetencesService) {}

  @Post()
  create(@Body() dto: any) { return this.service.create(dto); }

  @Get()
  findAll() { return this.service.findAll(); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}
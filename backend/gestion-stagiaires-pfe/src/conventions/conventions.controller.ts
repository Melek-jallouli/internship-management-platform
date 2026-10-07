import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConventionsService } from './conventions.service';
import { CreateConventionDto } from './dto/create-convention.dto';
import { UpdateConventionDto } from './dto/update-convention.dto';

@Controller('conventions')
export class ConventionsController {
  constructor(private readonly conventionsService: ConventionsService) {}

  @Post()
  create(@Body() createConventionDto: CreateConventionDto) {
    return this.conventionsService.create(createConventionDto);
  }

  @Get()
  findAll() {
    return this.conventionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conventionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.conventionsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conventionsService.remove(+id);
  }
}

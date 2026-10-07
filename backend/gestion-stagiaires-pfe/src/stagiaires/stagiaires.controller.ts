import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { StagiairesService } from "./stagiaires.service";

@Controller('stagiaires')
export class StagiairesController {
  constructor(private readonly stagiairesService: StagiairesService) {}

  @Post()
  async create(@Body() dto: any) {
    return await this.stagiairesService.create(dto);
  }

  @Get()
  findAll() {
    return this.stagiairesService.findAll();
  }
  @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: any) {
    return this.stagiairesService.update(+id, updateDto);
  }

  @Patch(':id/statut')
  async changeStatus(@Param('id') id: number,@Body('statut') statut: string
  ) {
  return this.stagiairesService.updateStatus(id, statut as any);
  }

  @Delete(':id')
    remove(@Param('id') id: string) {
    return this.stagiairesService.remove(+id);
  }

  @Get('stats/:userId')
  async getStats(@Param('userId') userId: string) {
    // On convertit l'ID en nombre car le service l'attend ainsi
    return this.stagiairesService.getDashboardStats(+userId);
  }
}
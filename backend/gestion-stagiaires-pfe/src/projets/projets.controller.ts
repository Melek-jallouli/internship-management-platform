import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ProjetsService } from "./projets.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/role.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { Role } from "src/auth/enums/role.enum";
import { CreateProjetDto } from "./dto/create-projet.dto";
import { UpdateProjetDto } from "./dto/update-projet.dto";

@Controller('projets')
export class ProjetsController {
  constructor(private readonly projetsService: ProjetsService) {}

  /**
   * 1. Les routes STATIQUES d'abord (available)
   */
  @Get('available')
  async findAllAvailable() {
    const projets = await this.projetsService.findAllAvailable();
    console.log('Nombre de projets envoyés au Frontend :', projets.length);
    return projets; 
  }

  /**
   * 2. Les routes avec RÔLES (Admin uniquement)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateProjetDto) {
    return await this.projetsService.create(dto);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAll() {
    return await this.projetsService.findAll();
  }

  /**
   * 3. Les routes avec PARAMÈTRES (:id) à la fin
   */
  @Get(':id')
async findOne(@Param('id') id: string) {
  // On convertit l'id en nombre avec +id et on appelle findOne (pas update)
  return this.projetsService.findOne(+id);
}

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateDto: UpdateProjetDto) {
    return this.projetsService.update(+id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.projetsService.remove(+id);
  }
}
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { EncadrantAcadService } from './encadrants.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';

@Controller('encadrants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EncadrantAcadController {
  constructor(private readonly encadrantAcadService: EncadrantAcadService) {}

  // Récupérer tous les encadrants académiques (souvent réservé à l'Admin)
  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.encadrantAcadService.findAll();
  }

  // Créer un encadrant académique manuellement
  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() body: any) {
    // Note: 'body' doit contenir l'objet 'utilisateur' complet selon ton service
    return this.encadrantAcadService.create(body);
  }

  // Mettre à jour les informations (Grade, Département, etc.)
  @Patch(':id')
  @Roles(Role.ADMIN, Role.ENCADRANT_ACAD)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.encadrantAcadService.update(id, body);
  }

  // Supprimer un encadrant
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.encadrantAcadService.remove(id);
  }
}
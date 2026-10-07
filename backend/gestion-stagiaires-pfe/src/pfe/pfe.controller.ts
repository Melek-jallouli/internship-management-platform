// src/pfe/pfe.controller.ts
import { 
  Controller, 
  Get, 
  Patch, 
  Param, 
  Body, 
  UseGuards, 
  Delete, 
  ParseIntPipe, 
  Req,
  BadRequestException
} from '@nestjs/common';
import { PfeService } from './pfe.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';     // Adapte le chemin
import { Roles } from '../auth/decorators/roles.decorator';   // Adapte le chemin
import { Role } from '../auth/enums/role.enum';
import type { Request } from 'express';

@Controller('pfe')
@UseGuards(JwtAuthGuard, RolesGuard) // Protection globale du contrôleur
export class PfeController {
  constructor(private readonly pfeService: PfeService) {}

  /**
   * GET /pfe
   * Récupérer la liste de tous les dossiers PFE (Utile pour l'Admin)
   */
  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    return await this.pfeService.findAll();
  }

  @Get('my-interns')
@UseGuards(JwtAuthGuard)
async getMyInterns(@Req() req: any) {
  // 1. Extraire l'ID (sub ou userId)
  const rawId = req.user?.userId || req.user?.sub;

  // 2. Conversion manuelle pour être sûr d'éviter le bug du pipe
  const encadrantId = Number(rawId);

  // 3. Vérification si la conversion a fonctionné
  if (!rawId || isNaN(encadrantId)) {
    throw new BadRequestException(
      `ID de l'encadrant invalide. Reçu: ${rawId}`
    );
  }

  return await this.pfeService.findInternsByEncadrant(encadrantId);
}


  /**
   * GET /pfe/:id
   * Récupérer les détails complets d'un PFE (Projet, Stagiaire, Encadrants)
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.pfeService.findOne(id);
  }


  /**
   * PATCH /pfe/:id/assign
   * Assigner l'encadrant professionnel et académique
   */
  @Patch(':id') // Retrait du /assign pour matcher ton code Angular
  @Roles(Role.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { encadrantProId: number; encadrantAcadId: number }
  ) {
    return await this.pfeService.assignSupervisors(
      id, 
      body.encadrantProId, 
      body.encadrantAcadId
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.pfeService.remove(id);
  }
}
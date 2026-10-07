import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { CondidatureService } from './condidature.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';


@Controller('candidature')
export class CondidatureController {
  constructor(private readonly condidatureService: CondidatureService) {}

  // 1. Le stagiaire postule à un projet
  @Post()
  @UseGuards(JwtAuthGuard)
  async postuler(@Request() req: any, @Body('id_projet') idProjet: number) {
    // Vérifie bien si c'est .userId, .id ou .sub selon ton JwtStrategy
    const idStagiaire = req.user.userId || req.user.id || req.user.sub; 
  
    if (!idStagiaire || !idProjet) {
      throw new BadRequestException("ID Stagiaire ou ID Projet manquant");
    }

    return await this.condidatureService.postuler(Number(idStagiaire), Number(idProjet));
  }
  @Get('pfe-valides')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getValidatedPfes() {
    return await this.condidatureService.findValidatedPfe();
  }

  // 3. L'Admin valide ou refuse une candidature
  @Patch(':id/accepter')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async valider(@Param('id') id: number) {
    return await this.condidatureService.accepter(id, 'ACCEPTE');
  }

  @Patch(':id/refuser')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async refuser(@Param('id') id: number) {
    return await this.condidatureService.refuser(id, 'REFUSE');
  }
  
  @Get('me')
@UseGuards(JwtAuthGuard)
async getMyCandidatures(@Request() req: any) {
  const userId = req.user.userId;
  const role = req.user.role;

  if (role === 'ENCADRANT_PRO' || role === 'ENCADRANT_ACAD') {
    // Si c'est un prof, on cherche les candidatures sur SES projets
    return await this.condidatureService.findByEncadrant(userId);
  } else if (role === 'STAGIAIRE') {
    // Si c'est un stagiaire, on cherche ses propres postulations
    return await this.condidatureService.findByStagiaire(userId);
  }
}

@Get('cand')
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN)
  async getAll() {
    return this.condidatureService.findAll();
  }
  
  // Ou une route spécifique pour les attentes
  @Get('pending')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async getPending() {
    return this.condidatureService.findPending();
  }

}
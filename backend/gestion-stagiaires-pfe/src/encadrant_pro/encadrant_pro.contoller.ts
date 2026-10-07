import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { EncadrantProService } from './encadrant_pro.service';
import { CreateEncadrantProDto } from './dto/create-encadrant.dto';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/enums/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import type { Request } from 'express';

@Controller('encadrant-pro')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EncadrantProController {
  constructor(private readonly encadrantProService: EncadrantProService) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.encadrantProService.findAll();
  }

  // Note : La création se fait généralement via le AuthService lors du Register,
  // mais on peut garder ce endpoint pour des ajouts administratifs.
  @Post()
  async create(@Body() Dto: any) {
    // Ici, il faudrait normalement récupérer l'utilisateur via un décorateur @User()
    // pour le lier au profil.
    return this.encadrantProService.create(Dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.ENCADRANT_ACAD)
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateEncadrantProDto>) {
    return this.encadrantProService.update(+id, updateDto);
  }

  @Get('stats-globales')
  @UseGuards(JwtAuthGuard) // Protection par JWT obligatoire pour identifier l'encadrant
  async getStatsGlobales(@Req() req: Request) {
    const encadrantId = req.user?.['userId']; // Récupère l'ID depuis le token
    return await this.encadrantProService.getGlobalDashboardStats(encadrantId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.encadrantProService.remove(+id);
  }
}
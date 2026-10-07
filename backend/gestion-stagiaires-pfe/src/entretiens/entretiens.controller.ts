import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { EntretiensService } from './entretiens.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';// Ton guard JWT
import { CreateEntretienDto } from './dto/create-entretien.dto';

@Controller('entretiens')
@UseGuards(JwtAuthGuard)
export class EntretiensController {
  constructor(private readonly entretiensService: EntretiensService) {}

  // L'Admin ou l'encadrant planifie une réunion
  @Post()
@UseGuards(JwtAuthGuard)
async create(@Body() createEntretienDto: CreateEntretienDto) {
  return this.entretiensService.schedule(createEntretienDto);
}

  // Récupérer les réunions d'un PFE spécifique
  @Get('pfe/:pfeId')
  async findByPfe(@Param('pfeId') pfeId: number) {
    return this.entretiensService.findAllByPfe(pfeId);
  }

  // Récupérer une réunion par son nom de salle (pour la sécurité avant de rejoindre)
  @Get('room/:roomName')
  async findByRoom(@Param('roomName') roomName: string) {
    return this.entretiensService.findOneByRoom(roomName);
  }

  @Get('stagiaire/:id')
  @UseGuards(JwtAuthGuard) // Sécurité garantie
  findAllByStagiaire(@Param('id') id: number) {
    return this.entretiensService.findByStagiaireId(id);
  }
}
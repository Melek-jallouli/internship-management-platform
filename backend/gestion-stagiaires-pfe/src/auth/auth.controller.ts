import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Request as RequestType } from 'express';
import { RolesGuard } from './guards/role.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from './enums/role.enum';
import { CondidatureService } from 'src/condidature/condidature.service';
import { CreateStagiaireDto } from 'src/stagiaires/dto/create-stagiaire.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private condidatureService: CondidatureService
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.mot_de_passe);
  }
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req: RequestType) {
    // On utilise l'ID qui est DANS le token, c'est impossible à tricher
    const userId = req.user!['sub']; // Récupère l'ID de l'utilisateur depuis le token
    return this.authService.logout(userId); 
}

  @Post('refresh')
  async refresh(@Body() body: { userId: number, refreshToken: string }) {
  // On passe bien les primitives (number et string), pas l'objet 'body' complet
  return this.authService.refreshTokens(body.userId, body.refreshToken);
}

  @UseGuards(JwtAuthGuard) // Cette route est protégée par l'Access Token
  @Get('profile')
  getProfile(@Request() req: RequestType) {
    return req.user; // Renvoie les infos de l'utilisateur connecté
  }

  @Get('pfe-valides')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getValidatedPfes() {
    return await this.condidatureService.findValidatedPfe();
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}

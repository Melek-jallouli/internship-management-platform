import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/utilisateur.service';
import * as bcrypt from 'bcryptjs';
import { EncadrantAcadService } from 'src/encadrants/encadrants.service';
import { EncadrantProService } from 'src/encadrant_pro/encadrant_pro.service';
import { AdminService } from 'src/admin/admin.service';
import { StagiairesService } from 'src/stagiaires/stagiaires.service'; // Assure-toi que ce chemin est correct
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private encadrantsService: EncadrantAcadService,
    private encadrantProService: EncadrantProService,
    private adminService: AdminService,
    private stagiairesService: StagiairesService // Correction : Injecté correctement ici
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    // Sécurité : Vérifier si l'utilisateur existe et a un mot de passe
    if (!user || !user.mot_de_passe) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    
    // Comparaison Bcrypt (password est une string, user.mot_de_passe est le hash)
    const cleanPassword = password?.trim();

    const isMatch = await bcrypt.compare(cleanPassword, user.mot_de_passe);

    if (!isMatch) {
      throw new UnauthorizedException('Identifiants');
    }

    const tokens = await this.generateTokens(user.id_utilisateur, user.email, user.type_utilisateur);

    // Sauvegarde du Refresh Token (Haché)
    await this.updateRefreshToken(user.id_utilisateur, tokens.refreshToken);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: {
        id: user.id_utilisateur,
        email: user.email,
        nom: user.nom,
        role: user.type_utilisateur.toUpperCase().trim() // Assure-toi que c'est 'ADMIN', 'STAGIAIRE', etc.
      }
    };
  }

  async generateTokens(userId: number, email: string, type_utilisateur: string) {
    const jwtPayload = {
      sub: userId,
      email: email,
      role: type_utilisateur.toUpperCase().trim(),
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: 'SECRET_ACCESS_TOKEN', // Utilise process.env.JWT_SECRET en prod
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: 'SECRET_REFRESH_TOKEN', 
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async updateRefreshToken(userId: number, refreshToken: string | null) {
    let hashedRefreshToken: string | null = null;
    
    if (refreshToken) {
      const salt = await bcrypt.genSalt(10);
      hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    }

    await this.usersService.update(userId, {
      currentRefreshToken: hashedRefreshToken,
    });
  }

  async refreshTokens(userId: number, refreshToken: string) {

  if (!refreshToken || typeof refreshToken !== 'string') {
    throw new UnauthorizedException('Token invalide');
  }

  const user = await this.usersService.findOne(userId);

  if (!user || !user.currentRefreshToken) {
    throw new ForbiddenException('Session expirée');
  }

  const match = await bcrypt.compare(refreshToken, user.currentRefreshToken);

  if (!match) {
    throw new ForbiddenException('Token incorrect');
  }

  const tokens = await this.generateTokens(
    user.id_utilisateur,
    user.email,
    user.type_utilisateur
  );

  await this.updateRefreshToken(user.id_utilisateur, tokens.refreshToken);

  return tokens;
}

  async register(dto: RegisterDto) {
  const profilData = dto.profilData; 

  const cleanPassword = dto.mot_de_passe?.trim();

  if (!cleanPassword) {
    throw new BadRequestException('Mot de passe invalide');
  }

  const hashedPassword = await bcrypt.hash(cleanPassword, 10);

  const user = await this.usersService.create({
    email: dto.email,
    nom: dto.nom,
    prenom: dto.prenom,
    telephone: dto.telephone,
    type_utilisateur: dto.type_utilisateur.toUpperCase().trim(),
    mot_de_passe: hashedPassword,
  });
 try {
  if (user.type_utilisateur === 'STAGIAIRE') {
    await this.stagiairesService.create({ 
      utilisateur: user, 
      etablissement_scolaire: profilData?.etablissement_scolaire || '', 
      niveau: profilData?.niveau || '' 
    });

  } else if (user.type_utilisateur === 'ENCADRANT_ACAD') {
    await this.encadrantsService.create({ 
      utilisateur: user, 
      // On s'assure d'envoyer les bonnes clés pour l'académique
      grade: profilData?.grade || '',
      etablissement: profilData?.etablissement || '',
      departement: profilData?.departement || '',
      specialite: profilData?.specialite || ''
    });

  } else if (user.type_utilisateur === 'ENCADRANT_PRO') {
    await this.encadrantProService.create({ 
      utilisateur: user, 
      poste: profilData?.poste || '',
      entreprise: profilData?.entreprise || '',
      annees_experience: profilData?.annees_experience || 0
    });
  }

} catch (error) {
  console.error("Erreur profil détaillé :", error);
  throw new BadRequestException("Erreur lors de la création du profil spécifique");
}

  return user;
}
  async logout(userId: number) {
    await this.updateRefreshToken(userId, null);
    return { message: 'Déconnexion réussie' };
  }
}
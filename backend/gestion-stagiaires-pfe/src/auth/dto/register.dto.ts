import { PickType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsObject, IsOptional } from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export enum UserRole {
  STAGIAIRE = 'STAGIAIRE',
  ENCADRANT_ACAD = 'ENCADRANT_ACAD',
  ENCADRANT_PRO = 'ENCADRANT_PRO',
}

export class RegisterDto extends PickType(CreateUserDto, ['email', 'mot_de_passe', 'nom', 'prenom', 'telephone'] as const) {
  @IsEnum(UserRole)
  @IsNotEmpty()
  type_utilisateur: UserRole;
  @IsOptional()
  @IsObject()
  profilData?: {
    etablissement_scolaire?: string;
    niveau?: string;
    etablissement?: string;
    departement?: string;
    grade?: string;
    specialite?: string;
    poste?: string;
    entreprise?: string;
    annees_experience?: number;
  };
}
import { IsEmail, IsNotEmpty, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString() @IsNotEmpty() nom: string;
  @IsString() @IsNotEmpty() prenom: string;
  @IsEmail() email: string;
  @IsString() @IsOptional() telephone?: string;
  @IsString() @MinLength(6) mot_de_passe: string;
  @IsEnum(['STAGIAIRE', 'ENCADRANT_ACAD', 'ENCADRANT_PRO', 'ADMIN'])
  type_utilisateur: string;
}
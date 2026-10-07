import { IsString, IsOptional, IsObject, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateAdminDto {
  @IsNotEmpty()
  @IsNumber()
  id_utilisateur: number; // L'ID de l'utilisateur déjà existant dans la table Utilisateur

  @IsNotEmpty()
  @IsString()
  role: string;

  @IsOptional()
  @IsObject()
  permissions?: any;

  @IsNotEmpty()
  @IsString()
  departement: string;
}
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateStagiaireDto {
  @IsNumber() @IsNotEmpty() id_stagiaire: number; // Doit correspondre à l'id_utilisateur créé
  @IsString() @IsNotEmpty() niveau: string;
  @IsString() @IsNotEmpty() etablissement: string;
  @IsOptional() statut?: string;
}
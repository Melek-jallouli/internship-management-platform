import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min } from "class-validator";

export class CreateEncadrantProDto {
    @IsNotEmpty()
      @IsNumber()
      id_utilisateur: number; // L'ID de l'utilisateur déjà existant dans la table Utilisateur
    
      @IsNotEmpty()
      @IsString()
      poste: string;
    
      @IsNotEmpty()
      @IsString()
      entreprise: string;
    
      @IsNotEmpty()
      @IsNumber()
      @Min(0)
      annees_experience: number;
}

import { IsOptional, IsString } from "class-validator";

export class CreateProjetDto {
  @IsString()
  titre: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional() // Permet de ne pas l'envoyer si on a une valeur par défaut en BDD
  etat: string;

  @IsString()
  technologies: string;
  @IsString()
  duree: string;
}
import { IsString, IsNotEmpty, IsDateString, IsNumber } from 'class-validator';

export class CreateEntretienDto {
  @IsString()
  @IsNotEmpty()
  titre: string;

  @IsDateString() // Valide que c'est une chaîne au format date ISO
  dateDebut: Date;

  @IsNumber()
  pfeId: number;

  @IsString()
  @IsNotEmpty()
  roomName: string;
}

import { IsNotEmpty, IsString, IsEnum, IsDateString, IsNumber } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  titre: string;

  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  date_limite: string;

  @IsEnum(['HAUTE', 'MOYENNE', 'BASSE'])
  priorite: string;

  @IsNumber()
  @IsNotEmpty()
  id_pfe: number;
}
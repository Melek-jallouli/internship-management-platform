import { PartialType } from '@nestjs/mapped-types';
import { CreateStagiaireDto } from './create-stagiaire.dto';

export class UpdateStagiaireDto extends PartialType(CreateStagiaireDto) {}

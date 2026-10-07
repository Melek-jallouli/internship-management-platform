import { PartialType } from '@nestjs/mapped-types';
import { CreateEntretienDto } from './create-entretien.dto';

export class UpdateEntretienDto extends PartialType(CreateEntretienDto) {}

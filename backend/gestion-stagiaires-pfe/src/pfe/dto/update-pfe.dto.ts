import { PartialType } from '@nestjs/mapped-types';
import { CreatePfeDto } from './create-pfe.dto';

export class UpdatePfeDto extends PartialType(CreatePfeDto) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreateEncadrantProDto } from './create-encadrant.dto';

export class UpdateEncadrantProDto extends PartialType(CreateEncadrantProDto) {}
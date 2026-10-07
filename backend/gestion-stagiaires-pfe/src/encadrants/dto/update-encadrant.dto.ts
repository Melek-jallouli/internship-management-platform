import { PartialType } from '@nestjs/mapped-types';
import { CreateEncadrantDto } from './create-encadrant.dto';

export class UpdateEncadrantDto extends PartialType(CreateEncadrantDto) {}

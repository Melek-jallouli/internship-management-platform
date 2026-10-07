import { Module } from '@nestjs/common';
import { EncadrantAcadService } from './encadrants.service';
import { EncadrantAcadController } from './encadrants.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncadrantAcademique } from './entities/encadrants.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([EncadrantAcademique])
    ],
  controllers: [EncadrantAcadController],
  providers: [EncadrantAcadService],
  exports: [EncadrantAcadService],
})
export class EncadrantsModule {}

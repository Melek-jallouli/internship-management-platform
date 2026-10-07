import { Module } from '@nestjs/common';
import { PfeService } from './pfe.service';
import { PfeController } from './pfe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pfe } from './entities/pfe.entity';
import { EncadranProtModule } from 'src/encadrant_pro/encadrant_pro.module';
import { EncadrantAcademique } from 'src/encadrants/entities/encadrants.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pfe, EncadranProtModule,
    EncadrantAcademique]),EncadranProtModule,
    EncadrantAcademique
  ],
  controllers: [PfeController],
  providers: [PfeService],
  exports: [PfeService],
})
export class PfeModule {}

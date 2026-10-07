import { Module } from '@nestjs/common';
import { EncadrantProService } from './encadrant_pro.service';
import { EncadrantProController } from './encadrant_pro.contoller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncadrantProfessionnel } from './entities/encadrant_pro.entitiy';
import { Task } from 'src/task/entities/task.entity';
import { Pfe } from 'src/pfe/entities/pfe.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([Pfe, Task,EncadrantProfessionnel])
    ],
  controllers: [EncadrantProController],
  providers: [EncadrantProService],
  exports: [TypeOrmModule, EncadrantProService]
})
export class EncadranProtModule {}
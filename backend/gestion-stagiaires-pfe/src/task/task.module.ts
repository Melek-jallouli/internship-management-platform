import { Module } from '@nestjs/common';
import { TasksService } from './task.service';
import { TasksController } from './task.controller';
import { Task } from './entities/task.entity';
import { Pfe } from 'src/pfe/entities/pfe.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
      TypeOrmModule.forFeature([Pfe, Task]), // Assurez-vous d'importer les entités nécessaires
    ],
  providers: [TasksService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TaskModule {}

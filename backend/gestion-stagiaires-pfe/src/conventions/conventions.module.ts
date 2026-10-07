import { Module } from '@nestjs/common';
import { ConventionsService } from './conventions.service';
import { ConventionsController } from './conventions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conventions } from './entities/conventions.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([Conventions])
    ],
  controllers: [ConventionsController],
  providers: [ConventionsService],
})
export class ConventionsModule {}

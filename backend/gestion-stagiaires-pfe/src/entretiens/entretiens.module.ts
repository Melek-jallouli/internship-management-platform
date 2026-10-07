import { Module } from '@nestjs/common';
import { EntretiensService } from './entretiens.service';
import { EntretiensController } from './entretiens.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entretien } from './entities/entretien.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([Entretien])
    ],
  controllers: [EntretiensController],
  providers: [EntretiensService],
  exports: [EntretiensService],
})
export class EntretiensModule {}

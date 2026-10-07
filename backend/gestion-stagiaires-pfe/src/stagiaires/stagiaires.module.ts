import { Module } from '@nestjs/common';
import { StagiairesService } from './stagiaires.service';
import { StagiairesController } from './stagiaires.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stagiaire } from './entities/stagiaire.entity';
import { Projet } from 'src/projets/entities/projet.entity';
import { Utilisateur } from 'src/users/entities/utilisateur.entity';
import { CvModule } from 'src/cv/cv.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([Stagiaire, Projet, Utilisateur]),
      CvModule,
    ],
  controllers: [StagiairesController],
  providers: [StagiairesService],
  exports: [StagiairesService]
})
export class StagiairesModule {}

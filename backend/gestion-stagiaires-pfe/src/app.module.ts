import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/utilisateur.module';
import { StagiairesModule } from './stagiaires/stagiaires.module';
import { EncadrantsModule } from './encadrants/encadrants.module';
import { AdminModule } from './admin/admin.module';
import { CvModule } from './cv/cv.module';
import { CompetencesModule } from './competences/competences.module';
import { EntretiensModule } from './entretiens/entretiens.module';
import { ProjetsModule } from './projets/projets.module';
import { PfeModule } from './pfe/pfe.module';
import { ConventionsModule } from './conventions/conventions.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './admin/entities/admin.entity';
import { Utilisateur } from './users/entities/utilisateur.entity';
import { Stagiaire } from './stagiaires/entities/stagiaire.entity';
import { EncadrantProfessionnel } from './encadrant_pro/entities/encadrant_pro.entitiy';
import { Competence } from './competences/entities/competence.entity';
import { Conventions } from './conventions/entities/conventions.entity';
import { Cv } from './cv/entities/cv.entity';
import { Entretien } from './entretiens/entities/entretien.entity';
import { Evaluation } from './evaluations/entities/evaluation.entity';
import { Pfe } from './pfe/entities/pfe.entity';
import { Projet } from './projets/entities/projet.entity';
import { EncadrantAcademique } from './encadrants/entities/encadrants.entity';
import { EncadranProtModule } from './encadrant_pro/encadrant_pro.module';
import { AuthModule } from './auth/auth.module';
import { MessageModule } from './message/message.module';
import { Message } from './message/entities/message.entity';
import { CondidatureModule } from './condidature/condidature.module';
import { TaskModule } from './task/task.module';
import { AiService } from './ai/ai.service';
import { AiController } from './ai/ai.controller';
import { AiModule } from './ai/ai.module';
import { HttpService } from '@nestjs/axios';
@Module({
  imports: [UsersModule, StagiairesModule, EncadrantsModule,EncadranProtModule , AdminModule, 
    CvModule, CompetencesModule, EntretiensModule, ProjetsModule, PfeModule, ConventionsModule, EvaluationsModule,
    MessageModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'gestionstagaire',
      entities: [Admin,Utilisateur,Stagiaire,EncadrantAcademique,
        EncadrantProfessionnel,Competence,Conventions,Cv,Entretien,Evaluation,Pfe,Projet,Message],
      autoLoadEntities: true,
      synchronize: false,
    }),
    AuthModule,
    CondidatureModule,
    EntretiensModule,
    TaskModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

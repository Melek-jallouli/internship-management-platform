import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { Stagiaire } from 'src/stagiaires/entities/stagiaire.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Cv, Stagiaire]),
  ],
  controllers: [CvController],
  providers: [CvService], // ✅ REMOVE HttpService
  exports: [CvService],
})
export class CvModule {}
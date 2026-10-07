import { Module } from '@nestjs/common';
import { CondidatureService } from './condidature.service';
import { CondidatureController } from './condidature.controller';
import { Condidature } from './entities/condidature.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pfe } from 'src/pfe/entities/pfe.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Condidature, Pfe]), // Ajoute Pfe à la liste des entités gérées par ce module
  ],
  providers: [CondidatureService],
  controllers: [CondidatureController],
  exports: [CondidatureService], // Exporter le service pour l'utiliser dans d'autres modules
})
export class CondidatureModule {}

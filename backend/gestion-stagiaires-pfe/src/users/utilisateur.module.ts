import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './utilisateur.service';
import { UsersController } from './utilisateur.controller';
import { Utilisateur } from './entities/utilisateur.entity'; // Vérifiez bien l'import

@Module({
  imports: [
    TypeOrmModule.forFeature([Utilisateur])
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exportez-le si vous l'utilisez dans d'autres modules (Stagiaires, etc.)
})
export class UsersModule {}
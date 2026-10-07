import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/utilisateur.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { CondidatureModule } from 'src/condidature/condidature.module';
import { EncadranProtModule } from 'src/encadrant_pro/encadrant_pro.module';
import { EncadrantsModule } from 'src/encadrants/encadrants.module';
import { AdminModule } from 'src/admin/admin.module';
import { StagiairesModule } from 'src/stagiaires/stagiaires.module';

@Module({
  imports: [
    CondidatureModule,
    UsersModule,
    StagiairesModule,
    PassportModule,
    EncadranProtModule,
    EncadrantsModule,
    AdminModule,
    JwtModule.register({
      secret: 'MA_CLE_SUPER_SECRETE', // À mettre dans un fichier .env plus tard
      signOptions: { expiresIn: '1h' }, // Le token expire après 1 heure
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}

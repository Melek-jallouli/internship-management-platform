// src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SECRET_ACCESS_TOKEN', // Le même que dans generateTokens
    });
  }

  async validate(payload: any) {
  console.log('Payload décodé par Passport :', payload); // <--- Vérifie si sub existe
  
  if (!payload.sub && !payload.userId) {
     // Si Passport arrive ici mais sans ID, il peut renvoyer une 400
     return null; 
  }

  return { 
    userId: payload.sub || payload.userId, 
    email: payload.email, 
    role: payload.role 
  };
}
}
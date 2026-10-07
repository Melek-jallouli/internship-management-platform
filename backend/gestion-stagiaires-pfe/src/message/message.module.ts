import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageService } from './message.service';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Message]),
    JwtModule.register({
      secret: 'SECRET_ACCESS_TOKEN', // Utilise la même clé que dans AuthModule
      signOptions: { expiresIn: '15m' },
    }),],
  providers: [MessageService, ChatGateway],
  controllers: [MessageController],
  exports: [MessageService]
})
export class MessageModule {}

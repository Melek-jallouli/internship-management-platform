import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { MessageService } from './message.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessageType } from './entities/message.entity';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // Dans message.controller.ts
  @Post('send')
  async sendMessage(@Body() body: { senderId: number, receiverId: number, text: string }) {
    return await this.messageService.saveMessage(body.senderId, body.receiverId, body.text);
  }

  @Get('conversation/:user1Id/:user2Id')
  async getChat(
    @Param('user1Id') user1Id: number,
    @Param('user2Id') user2Id: number,
  ) {
    return await this.messageService.getConversation(user1Id, user2Id);
  }

  // Marquer les messages comme lus quand on clique sur la conversation
  @Patch('read/:senderId/:receiverId')
  async markRead(@Param('senderId') sId: number, @Param('receiverId') rId: number) {
    return this.messageService.markAsRead(rId, sId);
  }

  // Obtenir le nombre total de messages non lus
  @Get('unread-count/:userId')
  async getUnreadCount(@Param('userId') userId: number) {
    const count = await this.messageService.countUnread(userId);
    return { unreadCount: count };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    dest: './uploads/messages', // Destination des fichiers
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    const fileUrl = `http://localhost:3000/uploads/messages/${file.filename}`;
  
    // On sauvegarde le message avec l'URL du fichier au lieu du texte
    const savedMsg = await this.messageService.saveMessage(
      Number(body.senderId), 
      Number(body.receiverId), 
      fileUrl, 
      MessageType.FILE // Ajoute un flag isFile dans ta DB
    );

    return savedMsg;
}
}
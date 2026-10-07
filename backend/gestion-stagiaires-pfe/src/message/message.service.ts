import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Message, MessageType } from "./entities/message.entity";
import { Repository } from "typeorm";

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async saveMessage(senderId: number, receiverId: number, contenu: string, type: MessageType = MessageType.TEXT) {
    const message = this.messageRepository.create({
      expediteur: { id_utilisateur: senderId } as any,
      destinataire: { id_utilisateur: receiverId } as any,
      contenu,
      type: type,
      lu: false,
      date_envoi: new Date(),
    });
    return await this.messageRepository.save(message);
  }

  async getConversation(user1: number, user2: number) {
    return await this.messageRepository.find({
      where: [
        { expediteur: { id_utilisateur: user1 }, destinataire: { id_utilisateur: user2 } },
        { expediteur: { id_utilisateur: user2 }, destinataire: { id_utilisateur: user1 } },
      ],
      relations: ['expediteur','destinataire'],
      order: { date_envoi: 'ASC' },
    });
  }
  // Marquer tous les messages d'une conversation comme lus
  async markAsRead(receiverId: number, senderId: number) {
    return await this.messageRepository.update(
      { 
        destinataire: { id_utilisateur: receiverId }, 
        expediteur: { id_utilisateur: senderId }, 
        lu: false 
      },
      { lu: true }
    );
  }

  // Compter le nombre de messages non lus pour un utilisateur
  async countUnread(userId: number) {
    return await this.messageRepository.count({
      where: { destinataire: { id_utilisateur: userId }, lu: false }
    });
  }
}
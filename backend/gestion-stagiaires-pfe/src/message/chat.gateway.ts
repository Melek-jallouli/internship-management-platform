import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessageService } from './message.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(
    private readonly messageService: MessageService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // 1. Récupérer le token depuis le header 'Authorization'
      const authHeader = client.handshake.headers.authorization || client.handshake.headers.Authorization;
      const token = (authHeader as string)?.split(' ')[1];

      console.log('Token reçu dans le Gateway :', token);

      if (!token) {
        console.log('Client déconnecté : Pas de token fourni');
        client.disconnect();
        return;
      }

      // 2. Vérifier le token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'SECRET_ACCESS_TOKEN', // Le même que dans ton AuthService
      });

      // 3. Stocker les infos de l'utilisateur dans l'objet client pour plus tard
      // 3. On attache l'utilisateur au socket pour l'utiliser dans @SubscribeMessage
      // Le payload contient généralement { sub: id, email: ... } ou { userId, email }
      client.data.user = payload;

      // 4. Optionnel : Rejoindre une salle privée basée sur l'ID utilisateur
      const userId = payload.sub || payload.userId;
      client.join(`user_${userId}`);

      console.log(`✅ [WS] Client connecté : ${payload.email} (ID: ${userId})`);

    } catch (e) {
      console.log('Client déconnecté : Token invalide');
      client.disconnect();
    }
  }

  @SubscribeMessage('sendMessage')
handleMessage(client: Socket, messageContent: string) {
  // 1. On récupère l'utilisateur que l'on a vérifié dans handleConnection
  const user = client.data.user;

  // 2. Si pour une raison étrange l'utilisateur n'est pas là, on ignore
  if (!user) {
    return;
  }

  // 3. On prépare l'objet de réponse propre
  const payload = {
    senderId: user.sub || user.userId, // ID extrait du token
    senderEmail: user.email,           // Email extrait du token
    message: messageContent,           // Le texte reçu
    timestamp: new Date().toISOString()
  };

  // 4. On diffuse à TOUT LE MONDE (Broadcast)
  this.server.emit('newMessage', payload);

  console.log(`[Chat] Message de ${user.email} : ${messageContent}`);
}

@SubscribeMessage('privateMessage')
async handlePrivateMessage(client: Socket, payload: { toId: number, message: string }) {
  const senderId = client.data.user.userId || client.data.user.sub;
  const receiverId = payload.toId;
  const text = payload.message;

  // 1. On utilise EXACTEMENT la même méthode que ton Controller
  const savedMsg = await this.messageService.saveMessage(senderId, receiverId, text);

  // 2. On envoie l'alerte en temps réel au destinataire
  this.server.to(`user_${receiverId}`).emit('newPrivateMessage', {
    id: savedMsg.id, // On récupère l'ID généré par la DB
    fromId: senderId,
    text: text,
    timestamp: new Date()
  });

  console.log(`[WS] Message sauvegardé et envoyé de ${senderId} à ${receiverId}`);
}

@SubscribeMessage('readConversation')
async handleRead(client: Socket, payload: { senderId: number }) {
  const receiverId = client.data.user.userId || client.data.user.sub;
  
  // 1. On met à jour en base de données
  await this.messageService.markAsRead(receiverId, payload.senderId);
  
  // 2. On prévient l'expéditeur que ses messages sont lus
  this.server.to(`user_${payload.senderId}`).emit('conversationRead', {
    by: receiverId
  });
}


}
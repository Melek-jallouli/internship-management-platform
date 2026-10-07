import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Définition de l'interface pour correspondre à ton entité NestJS
export interface Message {
  id: number;
  contenu: string;
  date_envoi: string;
  lu: boolean;
  expediteur: {
    id_utilisateur: number;
    nom: string;
    prenom: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/messages';

  getUtilisateurs(): Observable<any[]> {
  // Remplace par ta route réelle, ex: http://localhost:3000/users
  return this.http.get<any[]>('http://localhost:3000/users'); 
}

  /**
   * Récupère la conversation entre deux utilisateurs
   * GET /messages/conversation/:user1Id/:user2Id
   */
  getConversation(user1Id: number, user2Id: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.API_URL}/conversation/${user1Id}/${user2Id}`);
  }

  /**
   * Envoie un message texte simple
   * POST /messages/send
   */
  envoyerMessage(senderId: number, receiverId: number, text: string): Observable<Message> {
    const body = { 
      senderId: senderId, 
      receiverId: receiverId, 
      text: text 
    };
    return this.http.post<Message>(`${this.API_URL}/send`, body);
  }

  /**
   * Envoie un fichier (Image, PDF, etc.)
   * POST /messages/upload
   */
  uploadFichier(senderId: number, receiverId: number, file: File): Observable<Message> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('senderId', senderId.toString());
    formData.append('receiverId', receiverId.toString());

    return this.http.post<Message>(`${this.API_URL}/upload`, formData);
  }

  /**
   * Marque les messages comme lus
   * PATCH /messages/read/:senderId/:receiverId
   */
  marquerCommeLu(senderId: number, receiverId: number): Observable<any> {
    return this.http.patch(`${this.API_URL}/read/${senderId}/${receiverId}`, {});
  }

  /**
   * Récupère le nombre de messages non lus pour un utilisateur
   * GET /messages/unread-count/:userId
   */
  getNombreMessagesNonLus(userId: number): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(`${this.API_URL}/unread-count/${userId}`);
  }
}
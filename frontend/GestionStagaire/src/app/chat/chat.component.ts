import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';
import { ChatService, Message } from './chat.service';

export interface Utilisateur {
  id_utilisateur: any; // On utilise any ici pour accepter string ou number
  nom: string;
  prenom: string;
  email: string;
  type_utilisateur: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  private http = inject(HttpClient);
  private chatService = inject(ChatService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  utilisateurs: Utilisateur[] = []; 
  monId!: Number; 
  
  destinataireId?: string;
  destinataireNom?: string;
  messages: Message[] = [];
  nouveauMessage: string = '';

  private pollingSub?: Subscription;
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  ngOnInit() {
    // 3. ON VÉRIFIE SI ON EST DANS LE NAVIGATEUR
    if (isPlatformBrowser(this.platformId)) {
      
      const data = localStorage.getItem('user');
      if (data) {
        const user = JSON.parse(data);
        this.monId = Number(user.id_utilisateur || user.id);
        console.log("Chat initialisé pour l'utilisateur :", this.monId);
      }

      this.chargerTousLesUtilisateurs();

      // Le polling ne doit tourner QUE sur le navigateur
      this.pollingSub = interval(4000).subscribe(() => {
        if (this.destinataireId) this.chargerDiscussion(false);
      });
    }
  }

  ngOnDestroy() {
    if (this.pollingSub) this.pollingSub.unsubscribe();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  chargerTousLesUtilisateurs() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.http.get<any[]>('http://localhost:3000/users').subscribe({
      next: (data) => {
        const localStorageUser = JSON.parse(localStorage.getItem('user') || '{}');
        const currentId = Number(localStorageUser.id_utilisateur || localStorageUser.id);

        this.utilisateurs = data.filter(u => {
          const userIdInDb = Number(u.id_utilisateur || u.id);
          return userIdInDb !== currentId;
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Erreur API :", err)
    });
  }

  selectDestinataire(u: Utilisateur) {
    this.destinataireId = String(u.id_utilisateur || (u as any).id);
    this.destinataireNom = `${u.prenom} ${u.nom}`;
    this.messages = [];
    this.chargerDiscussion();
  }

  // Dans ton ChatComponent

chargerDiscussion(showLoading = true) {
  // 1. Sécurité : On ne fait rien si on est sur le serveur ou si les IDs manquent
  if (!isPlatformBrowser(this.platformId) || !this.destinataireId || !this.monId) {
    return;
  }

  this.chatService.getConversation(Number(this.monId), Number(this.destinataireId)).subscribe({
    next: (res) => {
      this.messages = res;
      
      // 2. On force Angular à rafraîchir l'écran immédiatement
      this.cdr.detectChanges(); 
      
      if (res.length > 0) {
        this.marquerCommeLu();
        // 3. On descend le scroll après le rendu
        setTimeout(() => this.scrollToBottom(), 0);
      }
    },
    error: (err) => console.error("Erreur chargement discussion:", err)
  });
}

  envoyer() {
    if (!this.nouveauMessage.trim() || !this.destinataireId || !this.monId) return;

    this.chatService.envoyerMessage(Number(this.monId), Number(this.destinataireId), this.nouveauMessage)
      .subscribe(() => {
        this.nouveauMessage = '';
        this.chargerDiscussion(false);
      });
  }

  marquerCommeLu() {
    if (this.destinataireId && this.monId) {
      this.chatService.marquerCommeLu(Number(this.destinataireId), Number(this.monId)).subscribe();
    }
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
}
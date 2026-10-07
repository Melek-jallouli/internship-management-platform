import { Component, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { AiService } from './ai.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Message {
  text: string;
  isBot: boolean;
  date: Date;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-bot.component.html',
  styleUrl: './chat-bot.component.css'
})
export class ChatBotComponent implements AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  // Signal pour gérer l'historique des messages
  messages = signal<Message[]>([
    { 
      text: "Bonjour ! Je suis l'IA experte du gestionnaire de PFE. Comment puis-je vous aider aujourd'hui ?", 
      isBot: true, 
      date: new Date() 
    }
  ]);

  userQuestion = signal<string>('');
  isLoading = signal<boolean>(false);

  constructor(private aiService: AiService) {}

  // Scroll automatique vers le bas à chaque nouveau message
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  sendMessage() {
    const question = this.userQuestion().trim();
    if (!question || this.isLoading()) return;

    // 1. Ajouter le message de l'utilisateur au signal
    this.messages.update(prev => [...prev, { 
      text: question, 
      isBot: false, 
      date: new Date() 
    }]);

    // 2. Préparer l'envoi
    this.userQuestion.set('');
    this.isLoading.set(true);

    // 3. Appel au service (vers NestJS -> Python)
    this.aiService.askChatbot(question).subscribe({
      next: (res) => {
        this.messages.update(prev => [...prev, { 
          text: res.reponse, 
          isBot: true, 
          date: new Date() 
        }]);
      },
      error: (err) => {
        console.error('Erreur Chatbot:', err);
        this.messages.update(prev => [...prev, { 
          text: "Désolé, je n'arrive pas à joindre mon module d'intelligence en ce moment.", 
          isBot: true, 
          date: new Date() 
        }]);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
}
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';

@Injectable()
export class AiService {
 private readonly pythonApiUrl = 'http://127.0.0.1:8000';

  constructor(
    private readonly httpService: HttpService
  ) {}


  // 1. Relais pour le filtrage de CV (Gestion du fichier binaire)
  async proxyToPythonFiltrer(file: Express.Multer.File, description: string) {
    const form = new FormData();
    form.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
    form.append('description_poste', description);

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.pythonApiUrl}/filtrer-cv`, form, {
          headers: form.getHeaders(),
        })
      );
      return response.data;
    } catch (error) {
      throw new HttpException("L'IA Python est injoignable", HttpStatus.BAD_GATEWAY);
    }
  }

  // 2. Relais pour le Chatbot
  async proxyToPythonChat(question: string) {
    const form = new FormData();
    form.append('question', question);

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.pythonApiUrl}/chatbot-expert`, form, {
          headers: form.getHeaders(),
        })
      );
      return response.data;
    } catch (error) {
      return { reponse: "Le module IA ne répond pas (Vérifiez si FastAPI est lancé)." };
    }
  }

  // 3. Relais pour l'estimation de tâches
  async proxyToPythonEstimer(description: string, consomme: number) {
    const form = new FormData();
    form.append('description', description);
    form.append('consomme', consomme.toString());

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.pythonApiUrl}/estimer-nouvelle-tache`, form, {
          headers: form.getHeaders(),
        })
      );
      return response.data;
    } catch (error) {
      throw new HttpException("Erreur lors de l'estimation IA", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async askChatbot(question: string) {
    // On prépare les données au format Form Data car Python utilise Form(...)
    const formData = new FormData();
    formData.append('question', question);

    try {
      const response = await firstValueFrom(
        this.httpService.post('http://localhost:8000/chatbot-expert', formData)
      );
      return response.data; // Retourne { reponse: "..." }
    } catch (error) {
      console.error("Erreur lors de l'appel à l'IA Python:", error);
      return { reponse: "Désolé, je rencontre des difficultés pour me connecter à mon cerveau Python." };
    }
  }
}
import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';

@Controller('ai') // Correspond à http://localhost:3000/ai
export class AiController {
  constructor(
    private readonly aiService: AiService
  ) {}

  @Post('filtrer-cv')
  @UseInterceptors(FileInterceptor('file'))
  async filtrerCv(
    @UploadedFile() file: Express.Multer.File,
    @Body('description_poste') description: string
  ) {
    // NestJS reçoit le fichier et l'envoie à ton Python FastAPI
    return this.aiService.proxyToPythonFiltrer(file, description);
  }

  @Post('chat')
  async chat(@Body('question') question: string) {
    // NestJS reçoit la question et l'envoie à ton chatbot Python
    return this.aiService.proxyToPythonChat(question);
  }

  @Post('estimer-tache')
  async estimerTache(
    @Body('description') description: string,
    @Body('consomme') consomme: number
  ) {
    return this.aiService.proxyToPythonEstimer(description, consomme);
  }
}
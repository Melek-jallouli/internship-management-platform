import { BadRequestException, Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import type { Response } from "express";
import { CvService } from "./cv.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/role.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { Role } from "src/auth/enums/role.enum";
import { Req } from "@nestjs/common";

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeCv(
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description: string,
  ) {
    return this.cvService.analyzeCv(file, description);
  }

@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async upload(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
  console.log("Données reçues dans le Body :", body);

  const userId = parseInt(body.idStagiaire);
  const projetId = parseInt(body.idProjet);

  if (isNaN(userId) || isNaN(projetId)) {
    console.error("Erreur de parsing - userId:", userId, "projetId:", projetId);
    throw new BadRequestException(`ID invalide. Reçu idStagiaire: ${body.idStagiaire}, idProjet: ${body.idProjet}`);
  }

  return await this.cvService.sendToPythonAI(
    file, 
    body.description, 
    userId, 
    projetId
  );
}

  @Get('download/:id')
  async download(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const cv = await this.cvService.findOne(+id);

    if (!cv || !cv.fichier_pdf) {
      throw new NotFoundException('Fichier non trouvé');
    }

    // On définit les headers pour que le navigateur comprenne que c'est un PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${cv.nom_fichier}"`,
      'Content-Length': cv.fichier_pdf.length,
    });

    // On envoie le Buffer (BLOB) directement
    res.end(cv.fichier_pdf);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard) // Optionnel : pour protéger la route
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('statut') statut: string // On extrait 'statut' envoyé par Angular
  ) {
    return await this.cvService.updateStatus(id, statut);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN) // Optionnel : Seul l'admin peut voir tous les CV
  async getAllCvs() {
    return await this.cvService.findAll();
  }

  @Get('classement/:idProjet')
  async getClassement(@Param('idProjet', ParseIntPipe) idProjet: number) {
    // Cette méthode appelle le service pour récupérer les données triées
    return await this.cvService.getTopCandidats(idProjet);
  }

  @Get('projet-actuel/:idStagiaire')
  async getProjetActuel(@Param('idStagiaire') idStagiaire: number) {
    return this.cvService.getDescriptionByCandidature(idStagiaire);
  }
}
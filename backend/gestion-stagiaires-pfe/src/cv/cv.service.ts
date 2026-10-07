import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { InjectRepository } from "@nestjs/typeorm";
import { Cv } from "./entities/cv.entity";
import { DataSource, Repository } from "typeorm";
import { Stagiaire } from "src/stagiaires/entities/stagiaire.entity";
import { firstValueFrom, Observable } from "rxjs";
import FormData from 'form-data';

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(Cv)
    private readonly repository: Repository<Cv>,
    @InjectRepository(Stagiaire)
    private readonly stagiaireRepository: Repository<Stagiaire>,
    private readonly httpService: HttpService,
    private readonly dataSource: DataSource,
    private readonly http: HttpService
  ) {}

  uploadCv(file: File, description: string, userId: number, idProjet: number): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', description);
  
  // Utilise EXACTEMENT le nom attendu par ton @Body() dans NestJS
  formData.append('idStagiaire', userId.toString()); 
  formData.append('idProjet', idProjet.toString());

  return this.http.post('http://localhost:3000/cv/upload', formData);
}


async uploadIdCv(file: Express.Multer.File, userId: number, description: string, projetId: number) {
  const formData = new FormData();
  formData.append('file', file.buffer, file.originalname);
  formData.append('description_poste', description);
  formData.append('id_stagiaire', userId.toString()); // On ajoute l'ID ici
  formData.append('id_projet', projetId.toString());

  return this.httpService.post('http://localhost:8000/filtrer-cv', formData);
}
  
 async getTopCandidats(idProjet: number) {
    const query = `
      SELECT 
        u.nom, 
        u.prenom, 
        s.etablissement_scolaire, 
        c.score_ia, 
        c.statut,
        c.nom_fichier,
        c.date_analyse
      FROM cv c
      JOIN utilisateur u ON c.id_stagiaire = u.id_utilisateur
      JOIN stagiaire s ON c.id_stagiaire = s.id_stagiaire
      WHERE c.id_projet = ?
      ORDER BY c.score_ia DESC
    `;
    
    // On exécute la requête avec l'ID sécurisé
    return await this.dataSource.query(query, [idProjet]);
  }
  
  async findOne(id: number): Promise<Cv> {
      const cv = await this.repository.findOne({ where: { id_cv: id } });
      if (!cv) {
        throw new NotFoundException(`Le CV avec l'ID ${id} n'existe pas.`);
      }
      return cv;
    }

  async findAll() {
  return await this.repository.find({
    relations: ['stagiaire'], // Pour savoir à quel stagiaire appartient le CV
    order: { id_cv: 'DESC' }
  });

}

async saveCv(file: Express.Multer.File, userId: number) {
  // 1. Trouver le stagiaire lié à cet utilisateur
  const stagiaire = await this.stagiaireRepository.findOne({
    where: { utilisateur: { id_utilisateur: userId } }
  });

  if (!stagiaire) {
    throw new NotFoundException("Profil stagiaire introuvable pour cet utilisateur");
  }

  // 2. Créer le CV en lui injectant l'objet stagiaire complet (ou son ID)
  const newCv = this.repository.create({
    nom_fichier: file.originalname,
    taille_fichier: file.size,
    fichier_pdf: file.buffer, // Ton entité attend un Buffer (type blob)
    statut: 'EN_ATTENTE',// ou le chemin vers votre storage
    stagiaire: stagiaire    // C'est ici que le lien se fait
  });

  return await this.repository.save(newCv);
}

async updateStatus(id: number, statut: string) {
  // 1. Vérifier si le CV existe
  const cv = await this.repository.findOneBy({ id_cv: id });
  
  if (!cv) {
    throw new NotFoundException(`Le CV avec l'ID ${id} n'existe pas.`);
  }

  // 2. Mettre à jour le statut
  cv.statut = statut;

  // 3. Sauvegarder les modifications
  return await this.repository.save(cv);
}

async sendToPythonAI(file: Express.Multer.File, description: string, userId: number, idProjet: number) {
  if (!userId || isNaN(userId)) {
    throw new BadRequestException("ID utilisateur invalide");
  }
  const stagiaire = await this.stagiaireRepository.findOne({
    where: { utilisateur: { id_utilisateur: userId } }
  });

  if (!stagiaire) {
    throw new NotFoundException("Profil stagiaire introuvable. Créez votre profil avant d'analyser un CV.");
  }

  // On utilise maintenant le VRAI id_stagiaire de la table stagiaire
  const realStagiaireId = stagiaire.id_stagiaire;

  const formData = new FormData();

  // 1. Le fichier (vérifie que la clé est bien 'file')
  formData.append('file', file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  // 2. Les champs texte - ATTENTION aux noms exacts de ton code Python
  formData.append('description_poste', description); // Correspond à description_poste dans Python
  
  // On envoie les IDs. Même si on fait .toString(), 
  // FastAPI tentera de les convertir en 'int' côté Python.
  formData.append('id_stagiaire', realStagiaireId.toString()); 
  formData.append('id_projet', idProjet.toString());

  try {
    const response = await firstValueFrom(
      this.httpService.post('http://127.0.0.1:8000/filtrer-cv', formData, {
        headers: {
          ...formData.getHeaders(),
        },
      })
    );
    return response.data;
  } catch (error: any) {
    // Si tu as encore une 422, ce log affichera exactement quel champ pose problème
    console.error('Réponse détaillée de Python :', error.response?.data);
    throw error;
  }
}
async analyzeCv(file: Express.Multer.File, description: string) {
  const formData = new FormData();

  formData.append('file', file.buffer, file.originalname);
  formData.append('description_poste', description);

  const response = await firstValueFrom(
    this.httpService.post('http://127.0.0.1:8000/filtrer-cv', formData, {
      headers: formData.getHeaders(),
    }),
  );

  return response.data;
}

async getProjetActuel(idStagiaire: number) {
  const query = `
    SELECT 
      p.id AS id_projet, 
      p.description_projet AS texte_description -- On force ce nom
    FROM projet p
    INNER JOIN candidature c ON p.id = c.id_projet
    WHERE c.id_stagiaire = ?
    ORDER BY c.id_candidature DESC
    LIMIT 1
  `;
  const res = await this.dataSource.query(query, [idStagiaire]);
  return res[0]; 
}

async getDescriptionByCandidature(idStagiaire: number) {
  const query = `
    SELECT p.id_projet, p.description 
    FROM projet p
    JOIN condidature c ON p.id_projet = c.id_projet
    WHERE c.id_stagiaire = ?
    ORDER BY c.id_candidature DESC -- On prend la dernière candidature en date
    LIMIT 1
  `;
  const result = await this.dataSource.query(query, [idStagiaire]);
  return result[0]; // Retourne { id: ..., description_projet: ... }
}

}
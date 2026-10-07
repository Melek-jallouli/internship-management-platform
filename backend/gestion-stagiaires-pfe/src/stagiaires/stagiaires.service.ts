import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Stagiaire } from "./entities/stagiaire.entity";
import { Repository } from "typeorm";
import { EncadrantProfessionnel } from "src/encadrant_pro/entities/encadrant_pro.entitiy";
import { Utilisateur } from "src/users/entities/utilisateur.entity";
import { Projet } from "src/projets/entities/projet.entity";

@Injectable()
export class StagiairesService {
  constructor(
    @InjectRepository(Stagiaire)
    private readonly repository: Repository<Stagiaire>,
    @InjectRepository(Projet)
    private readonly projetRepository: Repository<Projet>,
  ) {}

  async create(data: { 
    utilisateur: Utilisateur; 
    etablissement_scolaire: string; 
    niveau: string; 
  }) {
    // 1. On prépare l'entité Stagiaire
    const newStagiaire = this.repository.create({
      // On utilise l'ID de l'utilisateur comme clé primaire (Relation Partagée)
      id_stagiaire: data.utilisateur.id_utilisateur,
      
      // On lie l'objet utilisateur complet
      utilisateur: data.utilisateur,
      
      // Champs spécifiques venant du profilData
      etablissement_scolaire: data.etablissement_scolaire,
      niveau: data.niveau,
      
      // On peut définir un statut par défaut si nécessaire
      statut: 'EN_ATTENTE' 
    });

    // 2. Sauvegarde dans la table 'stagiaire'
    try {
      return await this.repository.save(newStagiaire);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Erreur lors de la création du profil Stagiaire :", errorMessage);
      throw error; 
    }
  }

  findAll() {
    return this.repository.find({ relations: ['utilisateur'] });
  }
  async update(id: number, updateDto: any) {
    await this.repository.update(id, updateDto);
    return this.repository.findOne({ where: { id_stagiaire: id }, relations: ['utilisateur'] });
  }

  async remove(id: number) {
    await this.repository.delete(id);
    return { message: `Le profil stagiaire ${id} a été supprimé` };
  }

  // stagiaires.service.ts

async updateStatus(id: number, nouveauStatut: 'EN_ATTENTE' | 'ACCEPTE' | 'EN_STAGE' | 'TERMINE') {
  // 1. On cherche le stagiaire
  const stagiaire = await this.repository.findOne({ 
    where: { id_stagiaire: id } 
  });

  if (!stagiaire) {
    throw new Error("Stagiaire non trouvé");
  }

  // 2. Mise à jour du statut
  stagiaire.statut = nouveauStatut;

  // 3. Sauvegarde
  return await this.repository.save(stagiaire);
}

// stagiaires.service.ts

async assignerEncadrant(idStagiaire: number, encadrant: EncadrantProfessionnel) {
  
  
  const stagiaire = await this.repository.findOne({ 
    where: { id_stagiaire: idStagiaire } 
  });

  if (!stagiaire) throw new NotFoundException("Stagiaire introuvable");

  // On lie l'objet encadrant
  stagiaire.encadrantProfessionnel = encadrant;

  // Logique métier : Seuls les dossiers validés passent en mode "actif"
  const statutsAutorises = ['ACCEPTE', 'EN_ATTENTE']; 
  if (statutsAutorises.includes(stagiaire.statut)) {
    stagiaire.statut = 'EN_STAGE';
  }

  return await this.repository.save(stagiaire);
}

async getDashboardStats(userId: number) {
  const nbProjets = await this.projetRepository.count();

  const user = await this.repository.findOne({ where: { id_stagiaire: userId } });

  return {
    status: user?.statut || 'En attente',
    nbProjets: nbProjets
  };
}

}
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Condidature } from './entities/condidature.entity';
import { Pfe } from 'src/pfe/entities/pfe.entity';

@Injectable()
export class CondidatureService {
  constructor(
    @InjectRepository(Condidature)
    private readonly candidatureRepository: Repository<Condidature>,
    @InjectRepository(Pfe)
    private readonly pfeRepository: Repository<Pfe>,
    private readonly dataSource: DataSource,

  ) {}
    

  // 2. Refuser une candidature
  async refuser(id: number, nouveauStatut: 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE'): Promise<Condidature> {
    const candidature = await this.candidatureRepository.findOne({ where: { id_candidature: id } });
    
    if (!candidature) {
      throw new NotFoundException(`Candidature #${id} introuvable`);
    }

    candidature.statut_candidature = nouveauStatut;
    return await this.candidatureRepository.save(candidature);
  }

// 3. Valider une candidature (Rappel)
async accepter(id: number ,nouveauStatut: 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE') {
  const candidature = await this.candidatureRepository.findOne({ where: { id_candidature: id } });

  if (!candidature) {
    throw new NotFoundException(`Candidature #${id} introuvable`);
  }

  candidature.statut_candidature = nouveauStatut;
  await this.candidatureRepository.save(candidature);

  // Création automatique du dossier PFE
  const nouveauPfe = this.pfeRepository.create({
  candidatureId: candidature.id_candidature, // Le lien est fait ici
  stagiaireId: candidature.id_stagiaire,
  projetId: candidature.id_projet,
  statut: 'EN_COURS'
});
await this.pfeRepository.save(nouveauPfe);
}

  // 4. Créer une candidature (Stagiaire)

async postuler(idStagiaire: number, idProjet: number): Promise<Condidature> {
  // 1. Vérifier si le stagiaire est déjà affecté à un projet
  const dejaAffecte = await this.candidatureRepository.findOne({
    where: { 
      id_stagiaire: idStagiaire, 
      statut_candidature: 'ACCEPTE' 
    }
  });

  if (dejaAffecte) {
    throw new BadRequestException('Vous avez déjà un projet validé. Vous ne pouvez plus postuler.');
  }

  // 2. Vérifier si le stagiaire a déjà postulé à CE projet précis (Doublon)
  const doublon = await this.candidatureRepository.findOne({
    where: { id_stagiaire: idStagiaire, id_projet: idProjet }
  });

  if (doublon) {
    throw new BadRequestException('Vous avez déjà une candidature en attente pour ce projet.');
  }

  // 3. Création de la candidature
  const candidature = this.candidatureRepository.create({
    id_stagiaire: idStagiaire,
    id_projet: idProjet,
    statut_candidature: 'EN_ATTENTE',
  });

  return await this.candidatureRepository.save(candidature);
}

async findByStagiaire(idStagiaire: number): Promise<Condidature[]> {
  // Ajoute un log pour vérifier ce que le backend reçoit vraiment
  console.log('🔍 Recherche candidatures pour le stagiaire ID:', idStagiaire);

  if (!idStagiaire) {
    console.error('❌ ID Stagiaire est undefined !');
    return []; // Retourne un tableau vide au lieu de faire planter la requête
  }

  try {
    return await this.candidatureRepository.find({
      // Assure-toi que 'id_stagiaire' est bien le nom de la colonne en BDD
      where: { id_stagiaire: idStagiaire }, 
      relations: ['projet'],
      order: { date_candidature: 'DESC' }
    });
  } catch (error) {
    console.error('❌ Erreur TypeORM dans findByStagiaire:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

async findByEncadrant(idEncadrant: number): Promise<Condidature[]> {
  return await this.candidatureRepository.find({
    where: {
      projet: {
        // On suppose que dans l'entité Projet, tu as une colonne id_encadrant_pro
        id_encadrant_pro: idEncadrant 
      }
    },
    relations: ['stagiaire', 'projet'],
    order: { date_candidature: 'DESC' }
  });
}

async findValidatedPfe() {
  return await this.candidatureRepository.find({
    where: { statut_candidature: 'ACCEPTE' }, // Filtre : seulement les stagiaires retenus
    relations: [
      'stagiaire', 
      'projet', 
      'encadrantPro', 
      'encadrantAcad',
      'encadrantPro.utilisateur', // Pour avoir le nom de l'encadrant pro
      'encadrantAcad.utilisateur'  // Pour avoir le nom du prof
    ]
  });
}

async findAll() {
  const candidatures = await this.candidatureRepository.find({
    relations: ['stagiaire', 'cv', 'stagiaire.utilisateur', 'projet'],
  });

  return candidatures.map(cand => {
    // On prépare un objet stagiaire propre avec les infos utilisateur
    const stagiaireInfos = cand.stagiaire ? {
      ...cand.stagiaire,
      ...(cand.stagiaire.utilisateur || {})
    } : null;

    return {
      ...cand,
      nom: stagiaireInfos?.nom,       // Pour faciliter l'accès dans le HTML
      prenom: stagiaireInfos?.prenom, // {{ cand.nom }} au lieu de {{ cand.stagiaire.nom }}
      etablissement: cand.stagiaire?.etablissement_scolaire,
      score_ia: cand.cv?.score_ia || null, // On remonte le score ici
      stagiaire: stagiaireInfos
    };
  });
}

  // Si tu veux uniquement celles qui attendent une validation :
  async findPending() {
    return await this.candidatureRepository.find({
      where: { statut_candidature: 'EN_ATTENTE' },
      relations: ['stagiaire', 'stagiaire.utilisateur', 'projet'],
    });
  }

}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pfe } from './entities/pfe.entity';
import { EncadrantProfessionnel } from 'src/encadrant_pro/entities/encadrant_pro.entitiy';
import { EncadrantAcademique } from 'src/encadrants/entities/encadrants.entity';

@Injectable()
export class PfeService {
  constructor(
    @InjectRepository(Pfe)
    private readonly pfeRepository: Repository<Pfe>,

    @InjectRepository(EncadrantProfessionnel)
    private readonly proRepository: Repository<EncadrantProfessionnel>,

    @InjectRepository(EncadrantAcademique)
    private readonly acadRepository: Repository<EncadrantAcademique>,
  ) {}

  /**
   * Récupère tous les PFE avec les relations complètes
   */
  async findAll() {
  return await this.pfeRepository.find({
    relations: [
      'stagiaire', 
      'stagiaire.utilisateur', 
      'projet',
      'encadrantPro', 
      'encadrantPro.utilisateur' // <--- TRÈS IMPORTANT : ne pas oublier ce niveau
    ]
  });
}

  /**
   * Récupère un PFE spécifique par son ID
   */
  async findOne(id: number): Promise<Pfe> {
    const pfe = await this.pfeRepository.findOne({
      where: { id },
      relations: [
        'stagiaire', 
        'projet', 
        'encadrantPro', 
        'encadrantPro.utilisateur',
        'encadrantAcad',
        'encadrantAcad.utilisateur'
      ],
    });

    if (!pfe) throw new NotFoundException(`Le dossier PFE #${id} est introuvable`);
    return pfe;
  }

  /**
   * Assigne les encadrants à un projet PFE
   */
  async assignSupervisors(id: number, proId: number, acadId: number) {
  const pfe = await this.pfeRepository.findOne({ where: { id } });
  if (!pfe) throw new NotFoundException('PFE introuvable');

  pfe.encadrantProId = proId;
  pfe.encadrantAcadId = acadId;

  return await this.pfeRepository.save(pfe); // <-- Vérifie bien cette ligne
}

async findInternsByEncadrant(encadrantId: number): Promise<Pfe[]> {
  // Log pour vérifier ce qui arrive au service
  console.log('ID envoyé au service:', encadrantId, 'Type:', typeof encadrantId);

  return await this.pfeRepository.find({
    where: {
      encadrantPro: { id_encadrant_pro: encadrantId } 
    },
    relations: ['stagiaire', 'stagiaire.utilisateur', 'projet']
  });
}
  /**
   * Supprimer un dossier PFE
   */
  async remove(id: number): Promise<void> {
    const pfe = await this.findOne(id);
    await this.pfeRepository.remove(pfe);
  }

  async update(id: number, updateDto: any) {
  await this.pfeRepository.update(id, updateDto);
  return this.findOne(id); // Retourne l'objet mis à jour avec ses relations
}

async updateStatus(id: number, nouveauStatut: 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE') {
  const candidature = await this.pfeRepository.findOne({ where: { candidatureId: id } });
  
  if (!candidature) {
    throw new NotFoundException(`Candidature ${id} introuvable`);
  }

  candidature.statut = nouveauStatut;
  return await this.pfeRepository.save(candidature);
}

}
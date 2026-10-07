import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entretien } from './entities/entretien.entity';


@Injectable()
export class EntretiensService {
  constructor(
    @InjectRepository(Entretien)
    private entretienRepository: Repository<Entretien>,
  ) {}

  // Sauvegarder une nouvelle réunion
  async schedule(data: any): Promise<Entretien[]> {
    const newEntretien = this.entretienRepository.create(data);
    return await this.entretienRepository.save(newEntretien);
  }

  // Liste des réunions pour un stagiaire/dossier précis
  async findAllByPfe(pfeId: number): Promise<Entretien[]> {
    return await this.entretienRepository.find({
      where: { pfe: { id: pfeId } },
      order: { date_Debut: 'ASC' },
    });
  }

  // Trouver une réunion spécifique
  async findOneByRoom(roomName: string): Promise<Entretien> {
    const entretien = await this.entretienRepository.findOne({ where: { room_Name: roomName } });
    if (!entretien) {
      throw new NotFoundException('Entretien introuvable');
    }
    return entretien;
  }

  async findByStagiaireId(stagiaireId: number): Promise<Entretien[]> {
  // Remplace 'reunionRepository' par ton repository réel
  return await this.entretienRepository.find({
    where: { pfe: { stagiaire: { id_stagiaire: stagiaireId } } },
    relations: ['pfe', 'pfe.stagiaire'] // Charge les relations nécessaires
  });
}
}
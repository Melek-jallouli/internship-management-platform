import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EncadrantAcademique } from "./entities/encadrants.entity";
import { Repository } from "typeorm";
import { Utilisateur } from "src/users/entities/utilisateur.entity";

@Injectable()
export class EncadrantAcadService {
  private encadrantRepo: Repository<EncadrantAcademique>;
  findOne(arg0: number) {
    throw new Error('Method not implemented.');
  }
  constructor(@InjectRepository(EncadrantAcademique) private repo: Repository<EncadrantAcademique>) {}

  async create(data: { 
    utilisateur: Utilisateur; 
    grade: string; 
    etablissement: string; 
    departement: string; 
    specialite: string; 
  }) {
    // 1. On prépare l'entité avec les données du DTO
    const newEncadrantAcad = this.repo.create({
      // On utilise l'ID de l'utilisateur comme clé primaire
      id_encadrant_acad: data.utilisateur.id_utilisateur,
      
      // On lie l'objet utilisateur pour la relation OneToOne
      utilisateur: data.utilisateur,
      
      // Champs spécifiques
      grade: data.grade,
      etablissement: data.etablissement,
      departement: data.departement,
      specialite: data.specialite
    });

    // 2. Sauvegarde en base de données
    try {
      return await this.repo.save(newEncadrantAcad);
    } catch (error) {
      console.error("Erreur lors de la création du profil académique :", error);
      throw error; // On relance l'erreur pour qu'elle soit captée par le try/catch de l'AuthService
    }
  }

  findAll() { return this.repo.find({ relations: ['utilisateur'] }); }
  async update(id: number, dto: any) { await this.repo.update(id, dto); return this.repo.findOneBy({ id_encadrant_acad: id }); }
  async remove(id: number) { return await this.repo.delete(id); }
}
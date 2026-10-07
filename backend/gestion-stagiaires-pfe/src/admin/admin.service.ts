import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { Utilisateur } from '../users/entities/utilisateur.entity';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  /**
   * Crée un profil Admin lié à un utilisateur existant
   */
  async create(createAdminDto: CreateAdminDto) {
    const { id_utilisateur, role, permissions, departement } = createAdminDto;

    // 1. Vérifier si un profil admin existe déjà pour cet ID
    const existingAdmin = await this.adminRepository.findOne({ 
      where: { id_admin: id_utilisateur } 
    });

    if (existingAdmin) {
      throw new ConflictException(`L'utilisateur ID ${id_utilisateur} possède déjà un profil Admin.`);
    }

    // 2. Création directe via l'ID
    const newAdmin = this.adminRepository.create({
      id_admin: id_utilisateur, // Utilise l'ID fourni dans le DTO
      role: role,
      permissions: permissions || { access: 'standard' },
      departement: departement
    });

    // 3. Sauvegarde
    try {
      return await this.adminRepository.save(newAdmin);
    } catch (error) {
      console.error("Erreur technique lors de la création de l'admin:", error.message);
      throw error;
    }
  }

  /**
   * Récupère tous les administrateurs avec leurs infos de base
   */
  async findAll() {
    return await this.adminRepository.find({
      relations: ['utilisateur'],
    });
  }

  /**
   * Récupère un admin spécifique par son ID
   */
  async findOne(id: number) {
    const admin = await this.adminRepository.findOne({
      where: { id_admin: id },
      relations: ['utilisateur'],
    });

    if (!admin) {
      throw new NotFoundException(`Admin avec l'ID ${id} non trouvé.`);
    }
    return admin;
  }

  /**
   * Met à jour le rôle ou les permissions d'un admin
   */
  async update(id: number, updateData: { role?: string; permissions?: any }) {
    const admin = await this.findOne(id);
    
    // Fusion des données
    Object.assign(admin, updateData);
    
    return await this.adminRepository.save(admin);
  }

  /**
   * Supprime un profil admin (Note: l'Utilisateur reste si onDelete n'est pas configuré globalement)
   */
  async remove(id: number) {
    const admin = await this.findOne(id);
    return await this.adminRepository.remove(admin);
  }
}
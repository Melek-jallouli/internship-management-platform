import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conventions } from './entities/conventions.entity';

@Injectable()
export class ConventionsService {
  constructor(
    @InjectRepository(Conventions)
    private readonly repository: Repository<Conventions>,
  ) {}

  async create(dto: any) {
    const convention = this.repository.create({
      ...dto,
      date_creation: new Date(),
    });
    return await this.repository.save(convention);
  }

  findAll() {
    return this.repository.find({
      relations: ['stagiaire', 'encadrantAcad', 'encadrantPro'],
    });
  }

  async findOne(id: number) {
    const convention = await this.repository.findOne({
      where: { id_convention: id },
      relations: ['stagiaire', 'encadrantAcad', 'encadrantPro'],
    });
    if (!convention) throw new NotFoundException(`Convention ${id} introuvable`);
    return convention;
  }

  // --- LA MÉTHODE UPDATE ---
  async update(id: number, updateDto: any) {
    // On fusionne les modifications
    await this.repository.update(id, updateDto);
    // On retourne la convention mise à jour avec ses relations
    return this.findOne(id);
  }

  async remove(id: number) {
    const convention = await this.findOne(id);
    await this.repository.delete(id);
    return { message: `Convention ${id} supprimée avec succès` };
  }
}
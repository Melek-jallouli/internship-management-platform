import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  // Créer une nouvelle tâche
  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const newTask = this.taskRepository.create(createTaskDto);
    return await this.taskRepository.save(newTask);
  }

  // Récupérer toutes les tâches d'un stagiaire spécifique (par id_pfe)
  async findByPfe(idPfe: number): Promise<Task[]> {
    return await this.taskRepository.find({
      where: { id_pfe: idPfe },
      order: { date_creation: 'DESC' }, // Les plus récentes en premier
    });
  }

  async findByStagiaire(userId: number): Promise<Task[]> {
    // On cherche les tâches où le PFE appartient au stagiaire lié à cet userId
    return await this.taskRepository.find({
      where: {
        // Supposons que dans ton entité Task, la relation vers PFE s'appelle 'pfe'
        pfe: {
          stagiaire: {
            utilisateur: { id_utilisateur: userId }
          }
        }
      },
      order: {
        date_limite: 'ASC', // Les plus urgentes en premier
      },
      // On peut charger les infos du projet si besoin d'afficher le titre du PFE
      relations: ['pfe', 'pfe.projet'] 
    });
  }

  // Mettre à jour le statut d'une tâche (ex: passer de EN_COURS à TERMINE)
  async updateStatus(id: number, statut: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id_task: id } });
    if (!task) {
      throw new NotFoundException(`Tâche avec l'ID ${id} introuvable`);
    }
    task.statut = statut;
    return await this.taskRepository.save(task);
  }

  // Supprimer une tâche
  async remove(id: number): Promise<void> {
    const result = await this.taskRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Tâche avec l'ID ${id} introuvable`);
    }
  }

  // Optionnel : Statistiques pour le dashboard de l'encadrant
  async getStatsByEncadrant(encadrantId: number) {
    // Cette requête compte les tâches liées aux PFEs de l'encadrant
    return await this.taskRepository
      .createQueryBuilder('task')
      .leftJoin('task.pfe', 'pfe')
      .where('pfe.encadrantPro = :encadrantId', { encadrantId })
      .select('task.statut', 'statut')
      .addSelect('COUNT(task.id_task)', 'count')
      .groupBy('task.statut')
      .getRawMany();
  }

  async findAllByEncadrant(encadrantId: number): Promise<Task[]> {
    return await this.taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.pfe', 'pfe') // Jointure pour vérifier l'appartenance
      .leftJoinAndSelect('pfe.stagiaire', 'stagiaire') // Optionnel : pour afficher le nom du stagiaire dans la liste
      .leftJoinAndSelect('stagiaire.utilisateur', 'user')
      .where('pfe.encadrantPro = :encadrantId', { encadrantId }) // Utilise la relation identifiée dans votre entité Pfe
      .orderBy('task.date_creation', 'DESC')
      .getMany();
  }
}
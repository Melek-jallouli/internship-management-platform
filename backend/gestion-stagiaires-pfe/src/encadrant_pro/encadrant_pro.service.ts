import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EncadrantProfessionnel } from "./entities/encadrant_pro.entitiy";
import { Repository } from "typeorm";
import { Utilisateur } from "src/users/entities/utilisateur.entity";
import { Pfe } from "src/pfe/entities/pfe.entity";
import { Task } from "src/task/entities/task.entity";

@Injectable()
export class EncadrantProService {
  constructor(
    @InjectRepository(Pfe)
    private readonly pfeRepository: Repository<Pfe>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(EncadrantProfessionnel) 
    private repo: Repository<EncadrantProfessionnel>,
  ) {}

  async create(data: { utilisateur: Utilisateur; poste: string; entreprise: string; annees_experience: number }) {
  const newEncadrant = this.repo.create({
      id_encadrant_pro: data.utilisateur.id_utilisateur,
      utilisateur: data.utilisateur,
      poste: data.poste, // Si data.poste est undefined, TypeORM mettra NULL ou la valeur par défaut
      entreprise: data.entreprise,
      annees_experience: data.annees_experience
    });
  return await this.repo.save(newEncadrant);
}

  async getGlobalDashboardStats(encadrantId: number) {
    // 1. Compter le nombre de stagiaires (PFEs) assignés
    const totalInterns = await this.pfeRepository.count({
      where: { encadrantProId: encadrantId }
    });

    // 2. Compter les projets actifs (on considère tous les PFEs assignés comme actifs ici)
    const activeProjects = totalInterns;

    // 3. Statistiques des tâches via une requête agrégée
    const taskStats = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoin('task.pfe', 'pfe')
      .where('pfe.id_encadrant_pro = :encadrantId', { encadrantId })
      .select('COUNT(task.id_task)', 'total')
      .addSelect("SUM(CASE WHEN task.statut = 'TERMINE' THEN 1 ELSE 0 END)", 'completed')
      .getRawOne();

    return {
      totalInterns,
      activeProjects,
      completedTasks: parseInt(taskStats.completed) || 0,
      totalTasks: parseInt(taskStats.total) || 0
    };
  }

  findAll() { return this.repo.find({ relations: ['utilisateur'] }); }
  async update(id: number, dto: any) { await this.repo.update(id, dto); return this.repo.findOneBy({ id_encadrant_pro: id }); }
  async remove(id: number) { return await this.repo.delete(id); }
}
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Projet } from "./entities/projet.entity";
import { Repository } from "typeorm";
import { CreateProjetDto } from "./dto/create-projet.dto";
import { UpdateProjetDto } from "./dto/update-projet.dto";

@Injectable()
export class ProjetsService {
  projetRepository: any;
  constructor(
    @InjectRepository(Projet)
    private readonly repository: Repository<Projet>,
  ) {}

  async create(dto: CreateProjetDto) {
    // On s'assure qu'un statut est défini par défaut si le DTO est vide
    const projetData = {
      ...dto,
      statut: dto.etat || 'DISPONIBLE' 
    };
    const projet = this.repository.create(projetData);
    return await this.repository.save(projet);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number): Promise<Projet> {
  const projet = await this.repository.findOneBy({ id_projet: id });
  if (!projet) {
    throw new NotFoundException(`Le projet avec l'ID ${id} n'existe pas`);
  }
  return projet;
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * ATTENTION : J'ai remplacé 'etat' par 'statut' pour correspondre 
   * à l'erreur SQL "Column statut specified twice" vue précédemment.
   */
  async updateStatut(idProjet: number, nouveauStatut: 'DISPONIBLE' | 'AFFECTE' | 'CLOTURE'): Promise<void> {
    await this.repository.update(idProjet, { statut: nouveauStatut });
  }

  async findAllAvailable(): Promise<Projet[]> {
    // Test 1 : Log pour le debug
    const tous = await this.repository.find();
    console.log('Total projets en BDD :', tous.length);

    // Test 2 : Filtre sur 'statut' (et non 'etat')
    const filtered = await this.repository.find({
      where: { statut: 'DISPONIBLE' }
    });
    
    console.log('Projets DISPONIBLE trouvés :', filtered.length);
    return tous;
  }
  async update(id: number, updateProjetDto: UpdateProjetDto) {
  const project = await this.projetRepository.preload({
    id_projet: id,
    ...updateProjetDto,
  });
  if (!project) throw new NotFoundException(`Projet #${id} non trouvé`);
  return this.projetRepository.save(project);
}
}
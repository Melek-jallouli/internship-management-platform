import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Competence } from "./entities/competence.entity";
import { Repository } from "typeorm";

@Injectable()
export class CompetencesService {
  constructor(@InjectRepository(Competence) private repo: Repository<Competence>) {}

  async create(dto: any) { return await this.repo.save(this.repo.create(dto)); }
  findAll() { return this.repo.find(); }
  async update(id: number, dto: any) { await this.repo.update(id, dto); return this.repo.findOneBy({ id_competence: id }); }
  async remove(id: number) { return await this.repo.delete(id); }
}
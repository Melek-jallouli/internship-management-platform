import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Utilisateur } from "./entities/utilisateur.entity";
import { Repository } from "typeorm";
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Utilisateur)
    private readonly repository: Repository<Utilisateur>,
  ) {}
  
  async findByEmail(email: string): Promise<Utilisateur | null> {
  return await this.repository.findOne({
    where: { email },
    select: ['id_utilisateur', 'email', 'mot_de_passe', 'nom', 'type_utilisateur']
  });
}

  async create(createUserDto: CreateUserDto) {

    const user = this.repository.create(createUserDto);
    return await this.repository.save(user);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOneBy({ id_utilisateur: id });
  }
  async update(id: number, updateDto: any) {
    await this.repository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number) {
  const user = await this.repository.findOneBy({ id_utilisateur: id });
  if (!user) {
    throw new NotFoundException(`L'utilisateur avec l'ID ${id} n'existe pas.`);
  }
  await this.repository.delete(id);
  return { message: `Utilisateur ${id} supprimé avec succès` };
}

async findByRole(role: string): Promise<Utilisateur[]> {
  return await this.repository.find({
    where: { type_utilisateur: role },
    // Optionnel : sélectionne uniquement ce dont tu as besoin pour la liste
    select: ['id_utilisateur', 'nom', 'prenom', 'email', 'type_utilisateur']
  });
}

async getProfil(id: number) {
    // On exclut le password de la réponse pour la sécurité
    const user = await this.repository.findOne({ 
      where: { id_utilisateur: id },
      select: ['id_utilisateur', 'nom', 'prenom', 'email', 'type_utilisateur'] 
    });
    return user;
  }

  async updatePassword(userId: number, oldPass: string, newPass: string) {
    const user = await this.repository.findOne({ where: { id_utilisateur: userId } });

    if (!user) {
      throw new NotFoundException(`L'utilisateur avec l'ID ${userId} n'existe pas.`);
    }

    // Vérifier l'ancien mot de passe
    const isMatch = await bcrypt.compare(oldPass, user.mot_de_passe);
    if (!isMatch) {
      throw new BadRequestException('Ancien mot de passe incorrect');
    }

    // Hasher le nouveau
    const salt = await bcrypt.genSalt();
    user.mot_de_passe = await bcrypt.hash(newPass, salt);

    return this.repository.save(user);
  }
}

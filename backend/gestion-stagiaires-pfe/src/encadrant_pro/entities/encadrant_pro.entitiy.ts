import { Stagiaire } from "src/stagiaires/entities/stagiaire.entity";
import { Utilisateur } from "src/users/entities/utilisateur.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from "typeorm";

@Entity('ENCADRANT_PROFESSIONNEL')
export class EncadrantProfessionnel {
  @PrimaryColumn({ type: 'bigint' })
  id_encadrant_pro: number;

  @OneToOne(() => Utilisateur,{ cascade: true,onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_encadrant_pro' })
  utilisateur: Utilisateur;

  @Column({ length: 100, nullable: true }) poste: string;
  @Column({ length: 150, nullable: true }) entreprise: string;
  @Column({ nullable: true }) annees_experience: number;

  @OneToMany(() => Stagiaire, (stagiaire) => stagiaire.encadrantProfessionnel)
  stagiaires: Stagiaire[];
}
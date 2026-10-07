import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Utilisateur } from '../../users/entities/utilisateur.entity';
import { EncadrantProfessionnel } from 'src/encadrant_pro/entities/encadrant_pro.entitiy';

@Entity('stagiaire')
export class Stagiaire {
  @PrimaryColumn({ type: 'bigint' })
  id_stagiaire!: number;

  @OneToOne(() => Utilisateur,{eager: true, cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_stagiaire' })
  utilisateur!: Utilisateur;

  @Column({ length: 50, nullable: true }) niveau: string;
  @Column({ length: 150, nullable: true ,name: 'etablissement_scolaire'}) etablissement_scolaire: string;
  @Column({ type: 'enum', enum: ['EN_ATTENTE', 'ACCEPTE', 'EN_STAGE', 'TERMINE'], nullable: true })
  statut!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  note_finale!: number;

  @ManyToOne(() => EncadrantProfessionnel, (encadrant) => encadrant.stagiaires, { nullable: true ,onDelete: 'SET NULL'})
  @JoinColumn({ name: 'id_encadrant_pro' })
  encadrantProfessionnel!: EncadrantProfessionnel;
}
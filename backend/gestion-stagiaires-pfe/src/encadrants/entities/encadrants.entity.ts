import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Utilisateur } from '../../users/entities/utilisateur.entity';

@Entity('ENCADRANT_ACADEMIQUE')
export class EncadrantAcademique {
  @PrimaryColumn({ type: 'bigint' })
  id_encadrant_acad!: number;

  @OneToOne(() => Utilisateur,{ cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_encadrant_acad' })
  utilisateur!: Utilisateur;

  @Column({ length: 50, nullable: true }) grade: string;
  @Column({ length: 150, nullable: true }) etablissement: string;
  @Column({ length: 100, nullable: true }) departement: string;
  @Column({ length: 100, nullable: true }) specialite: string;
}
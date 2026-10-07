import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('UTILISATEUR')
export class Utilisateur {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id_utilisateur!: number;

  @Column({ length: 100 }) nom: string;
  @Column({ length: 100 }) prenom: string;
  @Column({ unique: true, length: 150 }) email: string;
  @Column({ length: 20, nullable: true }) telephone: string;
  @Column({ select: false }) mot_de_passe: string;

  @Column({ type: 'enum', enum: ['STAGIAIRE', 'ENCADRANT_ACAD', 'ENCADRANT_PRO', 'ADMIN'], default: 'STAGIAIRE' })
  type_utilisateur!: string;

  @CreateDateColumn()
  date_inscription!: Date;

  @Column({ name: 'currentRefreshToken', nullable: true })
  currentRefreshToken!: string;
}
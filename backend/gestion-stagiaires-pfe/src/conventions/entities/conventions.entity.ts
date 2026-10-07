import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('CONVENTIONS')
export class Conventions {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id_convention!: number;

  @Column({ type: 'bigint' }) id_stagiaire: number;
  @Column({ type: 'bigint' }) id_encadrant_acad: number;
  @Column({ type: 'bigint' }) id_encadrant_pro: number;

  @Column({ type: 'date' }) date_debut: Date;
  @Column({ type: 'date' }) date_fin: Date;

  @Column({ type: 'blob', nullable: true }) fichier: Buffer;

  @Column({ default: false }) signature_stagiaire: boolean;
  @Column({ default: false }) signature_academique: boolean;
  @Column({ default: false }) signature_entreprise: boolean;

  @Column({ type: 'json', nullable: true }) clauses: any;
}
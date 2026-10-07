import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('EVALUATION')
export class Evaluation {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id_evaluation!: number;

  @Column({ type: 'bigint' }) id_stagiaire: number;
  @Column({ type: 'bigint' }) id_encadrant: number;

  @Column({ type: 'enum', enum: ['MI_PARCOURS', 'FINALE', 'SOUTENANCE'] })
  type_evaluation!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 }) note: number;
  @Column({ type: 'json', nullable: true }) criteres: any;
}
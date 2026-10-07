import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('COMPETENCE')
export class Competence {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id_competence!: number;

  @Column({ length: 100 }) nom: string;

  @Column({ type: 'enum', enum: ['TECHNIQUE', 'SOFT_SKILL', 'LINGUISTIQUE'] })
  categorie!: string;

  @Column({ type: 'text', nullable: true }) description: string;
}
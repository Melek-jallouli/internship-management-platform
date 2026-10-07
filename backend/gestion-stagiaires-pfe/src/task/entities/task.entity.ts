import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pfe } from 'src/pfe/entities/pfe.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id_task: number;

  @Column()
  titre: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  date_limite: Date;

  @Column({
    type: 'enum',
    enum: ['HAUTE', 'MOYENNE', 'BASSE'],
    default: 'MOYENNE',
  })
  priorite: string;

  @Column({
    type: 'enum',
    enum: ['A_FAIRE', 'EN_COURS', 'TERMINE'],
    default: 'A_FAIRE',
  })
  statut: string;

  @CreateDateColumn()
  date_creation: Date;

  // Relation avec le PFE (Un PFE peut avoir plusieurs tâches)
  @ManyToOne(() => Pfe, (pfe) => pfe.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_pfe' })
  pfe: Pfe;

  @Column()
  id_pfe: number;
}
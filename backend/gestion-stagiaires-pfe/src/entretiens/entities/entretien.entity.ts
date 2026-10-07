import { Pfe } from 'src/pfe/entities/pfe.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Entretien {
  @PrimaryGeneratedColumn()
  id_entretien!: number;

  @Column()
  titre!: string;

  @Column({ type: 'datetime' })
  date_Debut!: Date;

  @Column({ default: 30 })
  duree_minutes!: number;

  @Column({ unique: true })
  room_Name!: string;

  @ManyToOne(() => Pfe, (pfe) => pfe.entretiens) // <--- C'est ici que TypeORM cherche 'pfe'
  @JoinColumn({ name: 'pfeId' }) // Assure-toi que le nom ici correspond à ta colonne en BDD
  pfe!: Pfe;
}
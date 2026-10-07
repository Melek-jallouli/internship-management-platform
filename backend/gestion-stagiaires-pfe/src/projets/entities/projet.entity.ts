import { Stagiaire } from 'src/stagiaires/entities/stagiaire.entity';
import { Utilisateur } from 'src/users/entities/utilisateur.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('PROJET')
export class Projet {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id_projet!: number;

  @Column({ length: 200 }) titre: string;
  @Column({ type: 'text', nullable: true }) description: string;
  
  
  @Column({ type: 'json', nullable: true })
  technologies!: string; // Stocké comme JSON dans MySQL
  @Column({type: 'text'})
  duree!: string;
  @Column({ 
    type: 'enum', 
    enum: ['DISPONIBLE', 'AFFECTE', 'TERMINE'], 
    default: 'DISPONIBLE',
    name: 'statut' 
  })
  statut!: string; 

  @Column({ name: 'id_encadrant_pro', type: 'int', nullable: true })
  id_encadrant_pro!: number;
  @ManyToOne(() => Stagiaire)
  @JoinColumn({ name: 'id_stagiaire' }) // Le nom dans la base de données
  stagiaire!: Stagiaire; // 👈 C'est ce nom qu'il faut utiliser dans le code !
}
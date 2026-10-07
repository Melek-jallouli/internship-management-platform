import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Stagiaire } from '../../stagiaires/entities/stagiaire.entity';
import { Utilisateur } from 'src/users/entities/utilisateur.entity';
import { Projet } from 'src/projets/entities/projet.entity';

@Entity('CV')
export class Cv {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id_cv!: number;

  @Column({ type: 'bigint' })
  id_stagiaire!: number; // Vérifiez que cette ligne existe exactement ainsi

  @Column({ type: 'bigint' })
  id_projet!: number; // Ajout de la colonne pour le projet

  @ManyToOne(() => Projet)
  @JoinColumn({ name: 'id_projet' })
  projet!: Projet;

  @ManyToOne(() => Stagiaire)
  @JoinColumn({ name: 'id_stagiaire' })
  stagiaire!: Stagiaire;

  @Column({ type: 'blob', nullable: true })
  fichier_pdf!: Buffer;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score_ia!: number;

  @Column({ type: 'enum', enum: ['EN_ATTENTE', 'VALIDE', 'MOYEN', 'REFUSE'], default: 'EN_ATTENTE' })
  statut!: string;

  @Column({ length: 255 })
  nom_fichier!: string; // Vérifiez l'orthographe ici

  @Column({ type: 'text', nullable: true })
  contenu_extrait!: string;

  @Column({ type: 'bigint' })
  taille_fichier!: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  date_analyse!: Date;
}
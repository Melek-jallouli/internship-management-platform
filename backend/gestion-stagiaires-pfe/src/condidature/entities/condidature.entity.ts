import { Projet } from "src/projets/entities/projet.entity";
import { Stagiaire } from "src/stagiaires/entities/stagiaire.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { EncadrantProfessionnel } from "src/encadrant_pro/entities/encadrant_pro.entitiy";
import { EncadrantAcademique } from "src/encadrants/entities/encadrants.entity";
import { Pfe } from "src/pfe/entities/pfe.entity";
import { Cv } from "src/cv/entities/cv.entity";


@Entity('CONDIDATURE')
@Unique(['id_stagiaire', 'id_projet'])
export class Condidature {
  @PrimaryGeneratedColumn({ name: 'id_candidature' })
  id_candidature!: number;

  @Column({ name: 'id_stagiaire' })
  id_stagiaire!: number;

  @Column({ name: 'id_projet' })
  id_projet!: number;

  @Column({
    type: 'enum',
  enum: ['EN_ATTENTE', 'ACCEPTE', 'REFUSE'],
   default: 'EN_ATTENTE' })
  statut_candidature!: string;

  @Column({ type: 'timestamp', name: 'date_candidature', default: () => 'CURRENT_TIMESTAMP' })
  date_candidature!: Date;

  // Relation avec le Stagiaire
  @ManyToOne(() => Stagiaire)
  @JoinColumn({ name: 'id_stagiaire' })
  stagiaire!: Stagiaire;

  // Relation avec le Projet
  @ManyToOne(() => Projet)
  @JoinColumn({ name: 'id_projet' })
  projet!: Projet;

  @ManyToOne(() => EncadrantProfessionnel, { nullable: true })
  @JoinColumn({ name: 'id_encadrant_pro' })
  encadrantPro!: EncadrantProfessionnel;

  @ManyToOne(() => EncadrantAcademique, { nullable: true })
  @JoinColumn({ name: 'id_encadrant_acad' })
  encadrantAcad!: EncadrantAcademique;

  @OneToOne(() => Cv)
  @JoinColumn([
    { name: 'id_stagiaire', referencedColumnName: 'id_stagiaire' },
    { name: 'id_projet', referencedColumnName: 'id_projet' }
  ])
  cv: Cv;

  }


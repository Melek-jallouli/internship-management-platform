import { Condidature } from "src/condidature/entities/condidature.entity";
import { EncadrantProfessionnel } from "src/encadrant_pro/entities/encadrant_pro.entitiy";
import { EncadrantAcademique } from "src/encadrants/entities/encadrants.entity";
import { Entretien } from "src/entretiens/entities/entretien.entity";
import { Projet } from "src/projets/entities/projet.entity";
import { Stagiaire } from "src/stagiaires/entities/stagiaire.entity";
import { Task } from "src/task/entities/task.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('PFE') // Il est préférable de nommer la table en majuscules pour la cohérence
export class Pfe {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true }) // Sécurité : 1 candidature = 1 PFE max
  candidatureId!: number;


  // --- COLONNES ID (Pour faciliter les updates) ---
  @Column({ nullable: false })
  stagiaireId!: number;

  @Column({ nullable: false })
  projetId!: number;

  @Column({ nullable: true , name: 'id_encadrant_pro' })
  encadrantProId!: number;

  @Column({ nullable: true , name:'id_encadrant_acad'})
  encadrantAcadId!: number;

  // --- RELATIONS ---

  @ManyToOne(() => Stagiaire)
  @JoinColumn({ name: 'stagiaireId' })
  stagiaire!: Stagiaire;

  @ManyToOne(() => Projet)
  @JoinColumn({ name: 'projetId' })
  projet!: Projet;

  @OneToOne(() => Condidature)
  @JoinColumn({ name: 'candidatureId' })
  candidature!: Condidature;

  @ManyToOne(() => EncadrantProfessionnel, { nullable: true })
  @JoinColumn({ name: 'id_encadrant_pro' })
  encadrantPro!: EncadrantProfessionnel;

  @ManyToOne(() => EncadrantAcademique, { nullable: true })
  @JoinColumn({ name: 'id_encadrant_acad' })
  encadrantAcad!: EncadrantAcademique;

  @Column({ 
    type: 'varchar', 
    default: 'EN_COURS',
    length: 20 
  })
  statut!: string; // 'EN_COURS' | 'VALIDE' | 'A_VALIDER' | 'SOUTENU'

  @CreateDateColumn()
  dateCreation!: Date;

  @OneToMany(() => Entretien, (entretien) => entretien.pfe)
  entretiens!: Entretien[];

  @OneToMany(() => Task, (task) => task.pfe)
  tasks: Task[];
}
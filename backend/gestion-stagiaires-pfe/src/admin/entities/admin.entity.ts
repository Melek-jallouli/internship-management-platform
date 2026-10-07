import { Utilisateur } from 'src/users/entities/utilisateur.entity';
import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity('admin_rh')
export class Admin {
  @PrimaryColumn({ type: 'bigint' })
  id_admin!: number;

  @OneToOne(() => Utilisateur,{ onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_admin' })
  utilisateur!: Utilisateur;

  @Column({ length: 50, nullable: true }) role: string;

  @Column({ type: 'json', nullable: true })
  permissions!: any; // Format JSON pour les droits d'accès
  @Column({ length: 50, nullable: true })
  departement!: string; // Format JSON pour les droits d'accès
}
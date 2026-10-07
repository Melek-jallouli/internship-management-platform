import { Utilisateur } from "src/users/entities/utilisateur.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum MessageType {
  TEXT = 'text',
  FILE = 'file',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn({ type: 'bigint' }) // On reste cohérent avec bigint
  id!: number;

  @Column({ type: 'text' })
  contenu!: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type!: MessageType;

  @CreateDateColumn()
  date_envoi!: Date;

  @Column({ default: false })
  lu!: boolean;

  // TypeORM gérera automatiquement le lien BIGINT ici
  @ManyToOne(() => Utilisateur, { eager: true })
  @JoinColumn({ name: 'expediteurId', referencedColumnName: 'id_utilisateur' })
  expediteur!: Utilisateur;

  @ManyToOne(() => Utilisateur)
  @JoinColumn({ name: 'destinataireId', referencedColumnName: 'id_utilisateur' }) // 👈 Précise referencedColumnName si ce n'est pas "id"
  destinataire!: Utilisateur;
}
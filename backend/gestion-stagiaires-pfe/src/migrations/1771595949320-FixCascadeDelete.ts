import { MigrationInterface, QueryRunner } from "typeorm";

export class FixCascadeDelete1771595949320 implements MigrationInterface {
    name = 'FixCascadeDelete1771595949320'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`UTILISATEUR\` (\`id_utilisateur\` bigint NOT NULL AUTO_INCREMENT, \`nom\` varchar(100) NOT NULL, \`prenom\` varchar(100) NOT NULL, \`email\` varchar(150) NOT NULL, \`telephone\` varchar(20) NULL, \`mot_de_passe\` varchar(255) NOT NULL, \`type_utilisateur\` enum ('STAGIAIRE', 'ENCADRANT_ACAD', 'ENCADRANT_PRO', 'ADMIN') NOT NULL, \`date_inscription\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_d709e7030fa2f6b5efe2c95151\` (\`email\`), PRIMARY KEY (\`id_utilisateur\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`PROJET\` (\`id_projet\` bigint NOT NULL AUTO_INCREMENT, \`titre\` varchar(200) NOT NULL, \`description\` text NULL, \`statut\` enum ('DISPONIBLE', 'ATTRIBUE', 'TERMINE') NULL, \`technologies\` json NULL, PRIMARY KEY (\`id_projet\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`EVALUATION\` (\`id_evaluation\` bigint NOT NULL AUTO_INCREMENT, \`id_stagiaire\` bigint NOT NULL, \`id_encadrant\` bigint NOT NULL, \`type_evaluation\` enum ('MI_PARCOURS', 'FINALE', 'SOUTENANCE') NOT NULL, \`note\` decimal(5,2) NOT NULL, \`criteres\` json NULL, PRIMARY KEY (\`id_evaluation\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`STAGIAIRE\` (\`id_stagiaire\` bigint NOT NULL, \`niveau\` varchar(50) NULL, \`etablissement\` varchar(150) NULL, \`statut\` enum ('EN_ATTENTE', 'ACCEPTE', 'EN_STAGE', 'TERMINE') NULL, \`note_finale\` decimal(5,2) NULL, PRIMARY KEY (\`id_stagiaire\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`PFE\` (\`id_pfe\` bigint NOT NULL AUTO_INCREMENT, \`titre\` varchar(250) NOT NULL, \`mots_cles\` json NULL, \`id_stagiaire\` bigint NULL, \`id_projet\` bigint NULL, PRIMARY KEY (\`id_pfe\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ENCADRANT_ACADEMIQUE\` (\`id_encadrant_acad\` bigint NOT NULL, \`grade\` varchar(50) NULL, \`etablissement\` varchar(150) NULL, \`departement\` varchar(100) NULL, \`specialite\` varchar(100) NULL, PRIMARY KEY (\`id_encadrant_acad\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`CV\` (\`id_cv\` bigint NOT NULL AUTO_INCREMENT, \`id_stagiaire\` bigint NOT NULL, \`fichier_pdf\` blob NULL, \`score_ia\` decimal(5,2) NULL, \`statut\` enum ('EN_ATTENTE', 'VALIDE', 'REFUSE') NOT NULL DEFAULT 'EN_ATTENTE', \`nom_fichier\` varchar(255) NOT NULL, \`taille_fichier\` bigint NOT NULL, \`date_depot\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (\`id_cv\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`CONVENTIONS\` (\`id_convention\` bigint NOT NULL AUTO_INCREMENT, \`id_stagiaire\` bigint NOT NULL, \`id_encadrant_acad\` bigint NOT NULL, \`id_encadrant_pro\` bigint NOT NULL, \`date_debut\` date NOT NULL, \`date_fin\` date NOT NULL, \`fichier\` blob NULL, \`signature_stagiaire\` tinyint NOT NULL DEFAULT 0, \`signature_academique\` tinyint NOT NULL DEFAULT 0, \`signature_entreprise\` tinyint NOT NULL DEFAULT 0, \`clauses\` json NULL, PRIMARY KEY (\`id_convention\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ADMIN\` (\`id_admin\` bigint NOT NULL, \`role\` varchar(50) NULL, \`permissions\` json NULL, PRIMARY KEY (\`id_admin\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`COMPETENCE\` (\`id_competence\` bigint NOT NULL AUTO_INCREMENT, \`nom\` varchar(100) NOT NULL, \`categorie\` enum ('TECHNIQUE', 'SOFT_SKILL', 'LINGUISTIQUE') NOT NULL, \`description\` text NULL, PRIMARY KEY (\`id_competence\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ENTRETIEN\` (\`id_entretien\` bigint NOT NULL AUTO_INCREMENT, \`id_stagiaire\` bigint NOT NULL, \`id_evaluateur\` bigint NOT NULL, \`type_entretien\` enum ('RH', 'TECHNIQUE', 'PSYCHOTECHNIQUE') NOT NULL, \`date_entretien\` datetime NOT NULL, \`statut\` enum ('PROGRAMME', 'REALISE', 'ANNULE') NOT NULL, \`note\` decimal(5,2) NULL, \`decision\` enum ('ACCEPTE', 'REFUSE', 'EN_ATTENTE') NOT NULL, PRIMARY KEY (\`id_entretien\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`STAGIAIRE\` ADD CONSTRAINT \`FK_bc26ba436e1ce9236f513b33593\` FOREIGN KEY (\`id_stagiaire\`) REFERENCES \`UTILISATEUR\`(\`id_utilisateur\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`PFE\` ADD CONSTRAINT \`FK_a546331a9f7145220ebea2eb0f7\` FOREIGN KEY (\`id_stagiaire\`) REFERENCES \`STAGIAIRE\`(\`id_stagiaire\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`PFE\` ADD CONSTRAINT \`FK_93d2a717e0008fc3da1a66c8b83\` FOREIGN KEY (\`id_projet\`) REFERENCES \`PROJET\`(\`id_projet\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ENCADRANT_ACADEMIQUE\` ADD CONSTRAINT \`FK_5c48d3172bfcf3f4b2ab6ddc1ca\` FOREIGN KEY (\`id_encadrant_acad\`) REFERENCES \`UTILISATEUR\`(\`id_utilisateur\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`CV\` ADD CONSTRAINT \`FK_b76505d92767f118d25edfccbbe\` FOREIGN KEY (\`id_stagiaire\`) REFERENCES \`STAGIAIRE\`(\`id_stagiaire\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ADMIN\` ADD CONSTRAINT \`FK_20c8677d7fd27fbbde170a50868\` FOREIGN KEY (\`id_admin\`) REFERENCES \`UTILISATEUR\`(\`id_utilisateur\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ADMIN\` DROP FOREIGN KEY \`FK_20c8677d7fd27fbbde170a50868\``);
        await queryRunner.query(`ALTER TABLE \`CV\` DROP FOREIGN KEY \`FK_b76505d92767f118d25edfccbbe\``);
        await queryRunner.query(`ALTER TABLE \`ENCADRANT_ACADEMIQUE\` DROP FOREIGN KEY \`FK_5c48d3172bfcf3f4b2ab6ddc1ca\``);
        await queryRunner.query(`ALTER TABLE \`PFE\` DROP FOREIGN KEY \`FK_93d2a717e0008fc3da1a66c8b83\``);
        await queryRunner.query(`ALTER TABLE \`PFE\` DROP FOREIGN KEY \`FK_a546331a9f7145220ebea2eb0f7\``);
        await queryRunner.query(`ALTER TABLE \`STAGIAIRE\` DROP FOREIGN KEY \`FK_bc26ba436e1ce9236f513b33593\``);
        await queryRunner.query(`DROP TABLE \`ENTRETIEN\``);
        await queryRunner.query(`DROP TABLE \`COMPETENCE\``);
        await queryRunner.query(`DROP TABLE \`ADMIN\``);
        await queryRunner.query(`DROP TABLE \`CONVENTIONS\``);
        await queryRunner.query(`DROP TABLE \`CV\``);
        await queryRunner.query(`DROP TABLE \`ENCADRANT_ACADEMIQUE\``);
        await queryRunner.query(`DROP TABLE \`PFE\``);
        await queryRunner.query(`DROP TABLE \`STAGIAIRE\``);
        await queryRunner.query(`DROP TABLE \`EVALUATION\``);
        await queryRunner.query(`DROP TABLE \`PROJET\``);
        await queryRunner.query(`DROP INDEX \`IDX_d709e7030fa2f6b5efe2c95151\` ON \`UTILISATEUR\``);
        await queryRunner.query(`DROP TABLE \`UTILISATEUR\``);
    }

}

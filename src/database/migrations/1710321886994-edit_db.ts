import { MigrationInterface, QueryRunner } from "typeorm";

export class EditDb1710321886994 implements MigrationInterface {
    name = 'EditDb1710321886994'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`isVerified\` \`address\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`room_type\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`hotel\` ADD \`address\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`hotel\` ADD \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`booking\` ADD \`roomId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`room_type\` ADD \`bedType1\` varchar(120) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`room_type\` ADD \`bedType2\` varchar(120) NULL`);
        await queryRunner.query(`ALTER TABLE \`room_type\` ADD \`numberBedType1\` tinyint NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`room_type\` ADD \`numberBedType2\` tinyint NULL`);
        await queryRunner.query(`ALTER TABLE \`room_type\` ADD \`guestNumber\` varchar(120) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`address\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`address\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`hotel\` ADD CONSTRAINT \`FK_b12c4c148fa51232a466c825875\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`booking\` ADD CONSTRAINT \`FK_769a5e375729258fd0bbfc0a456\` FOREIGN KEY (\`roomId\`) REFERENCES \`room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`booking\` DROP FOREIGN KEY \`FK_769a5e375729258fd0bbfc0a456\``);
        await queryRunner.query(`ALTER TABLE \`hotel\` DROP FOREIGN KEY \`FK_b12c4c148fa51232a466c825875\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`address\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`address\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`room_type\` DROP COLUMN \`guestNumber\``);
        await queryRunner.query(`ALTER TABLE \`room_type\` DROP COLUMN \`numberBedType2\``);
        await queryRunner.query(`ALTER TABLE \`room_type\` DROP COLUMN \`numberBedType1\``);
        await queryRunner.query(`ALTER TABLE \`room_type\` DROP COLUMN \`bedType2\``);
        await queryRunner.query(`ALTER TABLE \`room_type\` DROP COLUMN \`bedType1\``);
        await queryRunner.query(`ALTER TABLE \`booking\` DROP COLUMN \`roomId\``);
        await queryRunner.query(`ALTER TABLE \`hotel\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`hotel\` DROP COLUMN \`address\``);
        await queryRunner.query(`ALTER TABLE \`room_type\` ADD \`name\` varchar(120) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`address\` \`isVerified\` tinyint NOT NULL DEFAULT '0'`);
    }

}

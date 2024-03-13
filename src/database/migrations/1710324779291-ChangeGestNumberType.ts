import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeGestNumberType1710324779291 implements MigrationInterface {
    name = 'ChangeGestNumberType1710324779291'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`room_type\` DROP COLUMN \`guestNumber\``);
        await queryRunner.query(`ALTER TABLE \`room_type\` ADD \`guestNumber\` tinyint NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`room_type\` DROP COLUMN \`guestNumber\``);
        await queryRunner.query(`ALTER TABLE \`room_type\` ADD \`guestNumber\` varchar(120) NOT NULL`);
    }

}

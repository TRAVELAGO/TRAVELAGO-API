import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAllTable1713436879331 implements MigrationInterface {
    name = 'CreateAllTable1713436879331'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_5738278c92c15e1ec9d27e3a09\` ON \`payment\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_5738278c92c15e1ec9d27e3a09\` ON \`payment\` (\`bookingId\`)`);
    }

}

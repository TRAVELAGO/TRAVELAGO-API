import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAllTable1709911908836 implements MigrationInterface {
    name = 'AddAllTable1709911908836'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`hotel\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(120) NOT NULL, \`images\` text NOT NULL, \`rate\` decimal(2,1) NULL, \`description\` varchar(255) NULL, \`status\` int NOT NULL DEFAULT '0', \`latitude\` varchar(50) NULL, \`longitude\` varchar(50) NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`cityId\` int NULL, FULLTEXT INDEX \`IDX_4e1924aa31055bed085a00a60b\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payment\` (\`id\` int NOT NULL AUTO_INCREMENT, \`amount\` decimal(10,2) NOT NULL, \`paymentMethod\` int NOT NULL, \`status\` int NOT NULL, \`PaymentDate\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`booking\` (\`id\` int NOT NULL AUTO_INCREMENT, \`status\` int NOT NULL DEFAULT '0', \`dateFrom\` timestamp NOT NULL, \`dateTo\` timestamp NOT NULL, \`totalAmount\` decimal(10,2) NOT NULL, \`totalDiscount\` decimal(10,2) NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`hotelId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`booking_detail\` (\`id\` int NOT NULL AUTO_INCREMENT, \`quantity\` int NOT NULL, \`subtotalAmount\` decimal(10,2) NOT NULL, \`Discount\` decimal(10,2) NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`bookingId\` int NULL, \`roomId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`feedback\` (\`id\` int NOT NULL AUTO_INCREMENT, \`rate\` decimal(2,1) NULL, \`comment\` text NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`roomId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`room\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`price\` decimal(10,2) NOT NULL, \`discount\` decimal(10,2) NOT NULL, \`images\` text NOT NULL, \`currentAvailable\` int NOT NULL, \`total\` int NOT NULL, \`description\` varchar(255) NULL, \`rate\` decimal(2,1) NULL, \`area\` float NULL, \`roomAmenities\` text NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`roomTypeId\` int NULL, \`hotelId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`room_type\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(120) NOT NULL, \`description\` varchar(255) NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`amenity\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`username\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`username\` varchar(40) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`password\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`password\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`fullName\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`fullName\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`city\` ADD CONSTRAINT \`FK_990b8a57ab901cb812e2b52fcf0\` FOREIGN KEY (\`countryId\`) REFERENCES \`country\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`hotel\` ADD CONSTRAINT \`FK_3880bd936c47980404af85d7fc0\` FOREIGN KEY (\`cityId\`) REFERENCES \`city\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD CONSTRAINT \`FK_b046318e0b341a7f72110b75857\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`booking\` ADD CONSTRAINT \`FK_336b3f4a235460dc93645fbf222\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`booking\` ADD CONSTRAINT \`FK_a8c9f0b0d2e97e4cdf825d3d830\` FOREIGN KEY (\`hotelId\`) REFERENCES \`hotel\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`booking_detail\` ADD CONSTRAINT \`FK_04d8a62cb7a450c23bb9b318e39\` FOREIGN KEY (\`bookingId\`) REFERENCES \`booking\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`booking_detail\` ADD CONSTRAINT \`FK_cc9d051fcbe51e88ca063a390be\` FOREIGN KEY (\`roomId\`) REFERENCES \`room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`feedback\` ADD CONSTRAINT \`FK_4a39e6ac0cecdf18307a365cf3c\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`feedback\` ADD CONSTRAINT \`FK_af8a9915923a23b0881d3416ebd\` FOREIGN KEY (\`roomId\`) REFERENCES \`room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`room\` ADD CONSTRAINT \`FK_9e55182c47f8ba7a32466131837\` FOREIGN KEY (\`roomTypeId\`) REFERENCES \`room_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`room\` ADD CONSTRAINT \`FK_2fac52abaa01b54156539cad11c\` FOREIGN KEY (\`hotelId\`) REFERENCES \`hotel\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`room\` DROP FOREIGN KEY \`FK_2fac52abaa01b54156539cad11c\``);
        await queryRunner.query(`ALTER TABLE \`room\` DROP FOREIGN KEY \`FK_9e55182c47f8ba7a32466131837\``);
        await queryRunner.query(`ALTER TABLE \`feedback\` DROP FOREIGN KEY \`FK_af8a9915923a23b0881d3416ebd\``);
        await queryRunner.query(`ALTER TABLE \`feedback\` DROP FOREIGN KEY \`FK_4a39e6ac0cecdf18307a365cf3c\``);
        await queryRunner.query(`ALTER TABLE \`booking_detail\` DROP FOREIGN KEY \`FK_cc9d051fcbe51e88ca063a390be\``);
        await queryRunner.query(`ALTER TABLE \`booking_detail\` DROP FOREIGN KEY \`FK_04d8a62cb7a450c23bb9b318e39\``);
        await queryRunner.query(`ALTER TABLE \`booking\` DROP FOREIGN KEY \`FK_a8c9f0b0d2e97e4cdf825d3d830\``);
        await queryRunner.query(`ALTER TABLE \`booking\` DROP FOREIGN KEY \`FK_336b3f4a235460dc93645fbf222\``);
        await queryRunner.query(`ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_b046318e0b341a7f72110b75857\``);
        await queryRunner.query(`ALTER TABLE \`hotel\` DROP FOREIGN KEY \`FK_3880bd936c47980404af85d7fc0\``);
        await queryRunner.query(`ALTER TABLE \`city\` DROP FOREIGN KEY \`FK_990b8a57ab901cb812e2b52fcf0\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`fullName\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`fullName\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`password\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`password\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`username\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`username\` varchar(255) NOT NULL`);
        await queryRunner.query(`DROP TABLE \`amenity\``);
        await queryRunner.query(`DROP TABLE \`room_type\``);
        await queryRunner.query(`DROP TABLE \`room\``);
        await queryRunner.query(`DROP TABLE \`feedback\``);
        await queryRunner.query(`DROP TABLE \`booking_detail\``);
        await queryRunner.query(`DROP TABLE \`booking\``);
        await queryRunner.query(`DROP TABLE \`payment\``);
        await queryRunner.query(`DROP INDEX \`IDX_4e1924aa31055bed085a00a60b\` ON \`hotel\``);
        await queryRunner.query(`DROP TABLE \`hotel\``);
    }

}

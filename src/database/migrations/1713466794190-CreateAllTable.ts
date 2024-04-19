import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAllTable1713466794190 implements MigrationInterface {
    name = 'CreateAllTable1713466794190'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`country\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(120) NOT NULL, FULLTEXT INDEX \`IDX_2c5aa339240c0c3ae97fcc9dc4\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`city\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(120) NOT NULL, \`postalCode\` varchar(100) NOT NULL, \`countryId\` varchar(36) NULL, FULLTEXT INDEX \`IDX_f8c0858628830a35f19efdc0ec\` (\`name\`), UNIQUE INDEX \`IDX_3d79495bc43fc7089fa5f9e7e5\` (\`postalCode\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(100) NOT NULL, \`fullName\` varchar(100) NOT NULL, \`address\` varchar(255) NULL, \`phoneNumber\` varchar(255) NOT NULL, \`role\` varchar(255) NOT NULL DEFAULT 'USER', \`avatar\` varchar(255) NULL, \`status\` int NOT NULL DEFAULT '1', \`refreshToken\` varchar(255) NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`accessToken\` varchar(255) NULL, \`codeOtp\` varchar(255) NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), UNIQUE INDEX \`IDX_f2578043e491921209f5dadd08\` (\`phoneNumber\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payment\` (\`id\` varchar(36) NOT NULL, \`amount\` decimal(10,2) NOT NULL, \`paymentMethod\` int NOT NULL, \`status\` int NOT NULL, \`paymentDate\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`transactionCode\` varchar(255) NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, \`bookingId\` varchar(36) NULL, UNIQUE INDEX \`REL_5738278c92c15e1ec9d27e3a09\` (\`bookingId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`booking\` (\`id\` varchar(36) NOT NULL, \`status\` int NOT NULL DEFAULT '0', \`type\` varchar(255) NOT NULL DEFAULT 'online', \`dateFrom\` timestamp NOT NULL, \`dateTo\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`totalAmount\` decimal(10,2) NOT NULL, \`totalDiscount\` decimal(10,2) NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`voucherId\` varchar(36) NULL, \`userId\` varchar(36) NULL, \`hotelId\` varchar(36) NULL, \`roomId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`feedback\` (\`id\` varchar(36) NOT NULL, \`rate\` decimal(2,1) NULL, \`comment\` text NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, \`roomId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`room_type\` (\`id\` varchar(36) NOT NULL, \`bedType1\` varchar(120) NOT NULL, \`bedType2\` varchar(120) NULL, \`numberBedType1\` int NOT NULL, \`numberBedType2\` int NULL, \`guestNumber\` int NOT NULL, \`description\` varchar(255) NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`room\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`price\` decimal(10,2) NOT NULL, \`discount\` decimal(10,2) NOT NULL DEFAULT '0.00', \`images\` json NULL, \`total\` int NOT NULL, \`description\` varchar(255) NULL, \`rate\` decimal(2,1) NULL, \`area\` float NULL, \`roomAmenities\` json NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`roomTypeId\` varchar(36) NULL, \`hotelId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`hotel\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(120) NOT NULL, \`images\` json NULL, \`rate\` decimal(2,1) NULL, \`address\` varchar(255) NULL, \`description\` varchar(255) NULL, \`status\` int NOT NULL DEFAULT '1', \`latitude\` varchar(50) NULL, \`longitude\` varchar(50) NULL, \`checkInTime\` time NOT NULL, \`checkOutTime\` time NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, \`cityId\` varchar(36) NULL, FULLTEXT INDEX \`IDX_4e1924aa31055bed085a00a60b\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`voucher\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(120) NOT NULL, \`minimumAmount\` int NULL, \`discountPercentage\` int NULL, \`maximumDiscount\` int NOT NULL, \`quantity\` int NOT NULL, \`type\` int NOT NULL, \`description\` varchar(255) NULL, \`expiredDate\` timestamp NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`createdById\` varchar(36) NULL, \`hotelId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`amenity\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`city\` ADD CONSTRAINT \`FK_990b8a57ab901cb812e2b52fcf0\` FOREIGN KEY (\`countryId\`) REFERENCES \`country\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD CONSTRAINT \`FK_b046318e0b341a7f72110b75857\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD CONSTRAINT \`FK_5738278c92c15e1ec9d27e3a098\` FOREIGN KEY (\`bookingId\`) REFERENCES \`booking\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`booking\` ADD CONSTRAINT \`FK_22729623108181860d69201733d\` FOREIGN KEY (\`voucherId\`) REFERENCES \`voucher\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`booking\` ADD CONSTRAINT \`FK_336b3f4a235460dc93645fbf222\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`booking\` ADD CONSTRAINT \`FK_a8c9f0b0d2e97e4cdf825d3d830\` FOREIGN KEY (\`hotelId\`) REFERENCES \`hotel\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`booking\` ADD CONSTRAINT \`FK_769a5e375729258fd0bbfc0a456\` FOREIGN KEY (\`roomId\`) REFERENCES \`room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`feedback\` ADD CONSTRAINT \`FK_4a39e6ac0cecdf18307a365cf3c\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`feedback\` ADD CONSTRAINT \`FK_af8a9915923a23b0881d3416ebd\` FOREIGN KEY (\`roomId\`) REFERENCES \`room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`room\` ADD CONSTRAINT \`FK_9e55182c47f8ba7a32466131837\` FOREIGN KEY (\`roomTypeId\`) REFERENCES \`room_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`room\` ADD CONSTRAINT \`FK_2fac52abaa01b54156539cad11c\` FOREIGN KEY (\`hotelId\`) REFERENCES \`hotel\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`hotel\` ADD CONSTRAINT \`FK_b12c4c148fa51232a466c825875\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`hotel\` ADD CONSTRAINT \`FK_3880bd936c47980404af85d7fc0\` FOREIGN KEY (\`cityId\`) REFERENCES \`city\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`voucher\` ADD CONSTRAINT \`FK_8a6c0cdb2002df264d9b4a7c96b\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`voucher\` ADD CONSTRAINT \`FK_25b7e21028e357cb323be13b625\` FOREIGN KEY (\`hotelId\`) REFERENCES \`hotel\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`voucher\` DROP FOREIGN KEY \`FK_25b7e21028e357cb323be13b625\``);
        await queryRunner.query(`ALTER TABLE \`voucher\` DROP FOREIGN KEY \`FK_8a6c0cdb2002df264d9b4a7c96b\``);
        await queryRunner.query(`ALTER TABLE \`hotel\` DROP FOREIGN KEY \`FK_3880bd936c47980404af85d7fc0\``);
        await queryRunner.query(`ALTER TABLE \`hotel\` DROP FOREIGN KEY \`FK_b12c4c148fa51232a466c825875\``);
        await queryRunner.query(`ALTER TABLE \`room\` DROP FOREIGN KEY \`FK_2fac52abaa01b54156539cad11c\``);
        await queryRunner.query(`ALTER TABLE \`room\` DROP FOREIGN KEY \`FK_9e55182c47f8ba7a32466131837\``);
        await queryRunner.query(`ALTER TABLE \`feedback\` DROP FOREIGN KEY \`FK_af8a9915923a23b0881d3416ebd\``);
        await queryRunner.query(`ALTER TABLE \`feedback\` DROP FOREIGN KEY \`FK_4a39e6ac0cecdf18307a365cf3c\``);
        await queryRunner.query(`ALTER TABLE \`booking\` DROP FOREIGN KEY \`FK_769a5e375729258fd0bbfc0a456\``);
        await queryRunner.query(`ALTER TABLE \`booking\` DROP FOREIGN KEY \`FK_a8c9f0b0d2e97e4cdf825d3d830\``);
        await queryRunner.query(`ALTER TABLE \`booking\` DROP FOREIGN KEY \`FK_336b3f4a235460dc93645fbf222\``);
        await queryRunner.query(`ALTER TABLE \`booking\` DROP FOREIGN KEY \`FK_22729623108181860d69201733d\``);
        await queryRunner.query(`ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_5738278c92c15e1ec9d27e3a098\``);
        await queryRunner.query(`ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_b046318e0b341a7f72110b75857\``);
        await queryRunner.query(`ALTER TABLE \`city\` DROP FOREIGN KEY \`FK_990b8a57ab901cb812e2b52fcf0\``);
        await queryRunner.query(`DROP TABLE \`amenity\``);
        await queryRunner.query(`DROP TABLE \`voucher\``);
        await queryRunner.query(`DROP INDEX \`IDX_4e1924aa31055bed085a00a60b\` ON \`hotel\``);
        await queryRunner.query(`DROP TABLE \`hotel\``);
        await queryRunner.query(`DROP TABLE \`room\``);
        await queryRunner.query(`DROP TABLE \`room_type\``);
        await queryRunner.query(`DROP TABLE \`feedback\``);
        await queryRunner.query(`DROP TABLE \`booking\``);
        await queryRunner.query(`DROP INDEX \`REL_5738278c92c15e1ec9d27e3a09\` ON \`payment\``);
        await queryRunner.query(`DROP TABLE \`payment\``);
        await queryRunner.query(`DROP INDEX \`IDX_f2578043e491921209f5dadd08\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_3d79495bc43fc7089fa5f9e7e5\` ON \`city\``);
        await queryRunner.query(`DROP INDEX \`IDX_f8c0858628830a35f19efdc0ec\` ON \`city\``);
        await queryRunner.query(`DROP TABLE \`city\``);
        await queryRunner.query(`DROP INDEX \`IDX_2c5aa339240c0c3ae97fcc9dc4\` ON \`country\``);
        await queryRunner.query(`DROP TABLE \`country\``);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateReporterIdColumnInTweetTable1636278727298 implements MigrationInterface {
    name = 'CreateReporterIdColumnInTweetTable1636278727298'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tweet" ADD "reporter_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tweet" DROP COLUMN "reporter_id"`);
    }

}

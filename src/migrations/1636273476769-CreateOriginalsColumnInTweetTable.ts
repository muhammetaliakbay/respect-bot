import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateOriginalsColumnInTweetTable1636273476769 implements MigrationInterface {
    name = 'CreateOriginalsColumnInTweetTable1636273476769'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tweet" ADD "originals" character varying array`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tweet" DROP COLUMN "originals"`);
    }

}
